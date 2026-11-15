import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, onBeforeRender } from "@babylonjs/lite";

/** Rotation multiplier applied to every drag increment. */
const DRAG_SCALE = 2;

/**
 * Attach the library's standard orbit controls to `camera`, with drag rotation
 * doubled. Wheel zoom and pan are left exactly as the library does them.
 *
 * How it works: the library's pointer and touch handlers add each drag increment
 * to `inertialAlphaOffset` / `inertialBetaOffset`, and `applyInertia` integrates
 * and decays those offsets every frame. The controls expose no sensitivity option,
 * so instead we run after the library's handlers on the canvas, measure the
 * increment each event added, and add it again so the total is doubled. Because
 * the glide is just the decay of those offsets, it doubles too.
 *
 * Returns a cleanup function that removes every listener and the per-frame hook.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // Registered after attachControl so that, for each event on the canvas, the
    // library's handler has already accumulated its increment when we run.
    const detachControls = attachControl(camera, canvas, scene);

    // Offsets as the library left them after its last per-frame update.
    let lastAlpha = camera.inertialAlphaOffset;
    let lastBeta = camera.inertialBetaOffset;

    // Runs after the library's applyInertia (registered later on the same frame hook),
    // so the offsets now reflect this frame's integration and decay.
    const removeFrameHook = onBeforeRender(scene, () => {
        lastAlpha = camera.inertialAlphaOffset;
        lastBeta = camera.inertialBetaOffset;
    });

    // Runs after the library's pointer/touch handler for the same event.
    // Anything added since the last frame update is this event's increment.
    const onDragInput = (): void => {
        const alphaAdded = camera.inertialAlphaOffset - lastAlpha;
        const betaAdded = camera.inertialBetaOffset - lastBeta;

        if (alphaAdded !== 0) {
            camera.inertialAlphaOffset = lastAlpha + DRAG_SCALE * alphaAdded;
        }
        if (betaAdded !== 0) {
            camera.inertialBetaOffset = lastBeta + DRAG_SCALE * betaAdded;
        }

        lastAlpha = camera.inertialAlphaOffset;
        lastBeta = camera.inertialBetaOffset;
    };

    canvas.addEventListener("pointermove", onDragInput);
    canvas.addEventListener("touchmove", onDragInput, { passive: true });

    return () => {
        canvas.removeEventListener("pointermove", onDragInput);
        canvas.removeEventListener("touchmove", onDragInput);
        removeFrameHook();
        detachControls();
    };
}
