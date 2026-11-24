import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl } from "@babylonjs/lite";

// The library's own fly controls move the camera by X per held-key frame.
// We add EXTRA_FACTOR more of whatever the library moved it, so the total is
// (1 + EXTRA_FACTOR) = 20 times as far.
//
// `speed` is deliberately left alone: the library also uses it to decide when
// mouse-look inertia stops, so changing it would change how far a drag turns.
const EXTRA_FACTOR = 19;

// Keys the library uses for movement (WASD, arrows, rise/sink keys).
const MOVEMENT_CODES = new Set<string>([
    "KeyW",
    "KeyA",
    "KeyS",
    "KeyD",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "Space",
    "PageUp",
    "ShiftLeft",
    "ShiftRight",
    "PageDown",
]);

export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // Library controls: keyboard movement, mouse look, and their own listeners.
    const detachLibrary = attachFreeControl(camera, canvas, scene);

    const held = new Set<string>();
    // True if a movement key was released since the last frame. The library may
    // still move the camera in the frame after release, so that frame still counts.
    let releasedSinceFrame = false;

    let lastX = camera.position.x;
    let lastY = camera.position.y;
    let lastZ = camera.position.z;
    let frameId = 0;
    let disposed = false;

    const onKeyDown = (e: KeyboardEvent): void => {
        if (MOVEMENT_CODES.has(e.code)) {
            held.add(e.code);
        }
    };

    const onKeyUp = (e: KeyboardEvent): void => {
        if (held.delete(e.code)) {
            releasedSinceFrame = true;
        }
    };

    const onBlur = (): void => {
        if (held.size > 0) {
            releasedSinceFrame = true;
        }
        held.clear();
    };

    const tick = (): void => {
        if (disposed) {
            return;
        }

        const p = camera.position;
        const t = camera.target;
        const active = held.size > 0 || releasedSinceFrame;

        if (active) {
            // How far the library moved the camera since our last frame.
            const dx = (p.x - lastX) * EXTRA_FACTOR;
            const dy = (p.y - lastY) * EXTRA_FACTOR;
            const dz = (p.z - lastZ) * EXTRA_FACTOR;
            if (dx !== 0 || dy !== 0 || dz !== 0) {
                // Shift target by the same amount so the view direction is unchanged.
                p.x += dx;
                p.y += dy;
                p.z += dz;
                t.x += dx;
                t.y += dy;
                t.z += dz;
            }
        }

        releasedSinceFrame = false;
        lastX = p.x;
        lastY = p.y;
        lastZ = p.z;

        frameId = requestAnimationFrame(tick);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    frameId = requestAnimationFrame(tick);

    return () => {
        disposed = true;
        cancelAnimationFrame(frameId);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        window.removeEventListener("blur", onBlur);
        held.clear();
        detachLibrary();
    };
}
