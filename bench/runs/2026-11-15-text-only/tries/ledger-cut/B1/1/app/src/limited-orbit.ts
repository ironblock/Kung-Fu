import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl } from "@babylonjs/lite";

type FrameHook = () => void;

// The scene keeps its per-frame hooks in this list. Camera control modules push their
// hooks onto the tail, and the scene runs the list head to tail each frame.
interface SceneWithFrameHooks {
  _beforeRender: FrameHook[];
}

const noop: FrameHook = () => {};

// Canvas events after which the radius is re-clamped synchronously, so the limit also holds
// between frames. These are registered after the library's controls, so they run after them.
const INPUT_EVENTS = ["wheel", "pointermove", "pointerup", "touchmove", "touchend"] as const;

export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (!(Number.isFinite(minDistance) && Number.isFinite(maxDistance) && minDistance > 0 && maxDistance >= minDistance)) {
        throw new RangeError(
            `attachLimitedOrbit: need 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`,
        );
    }

    const clampRadius = (): void => {
        const r = camera.radius;
        const clamped = r < minDistance ? minDistance : r > maxDistance ? maxDistance : r;
        if (clamped !== r) {
            camera.radius = clamped;
        }
    };

    // Attach the library's controls first, so that the hooks below run after their per-frame work.
    const detachControls = attachControl(camera, canvas, scene);

    // Bring an out-of-range starting distance inside the limits right away.
    clampRadius();

    // Per-frame clamp on the tail of the scene's hook list. It runs after the controls'
    // inertia and movement hooks, so the distance is in range when the frame is drawn.
    // (A hook from onBeforeRender would run before that inertia and could leave the distance out of range.)
    const hooks = (scene as unknown as SceneWithFrameHooks)._beforeRender;
    const frameHook: FrameHook = () => clampRadius();
    hooks.push(frameHook);

    const onInput = (): void => clampRadius();
    for (const type of INPUT_EVENTS) {
        canvas.addEventListener(type, onInput);
    }

    let disposed = false;
    return () => {
        if (disposed) {
            return;
        }
        disposed = true;

        for (const type of INPUT_EVENTS) {
            canvas.removeEventListener(type, onInput);
        }

        // Remove the frame hook without shifting the hooks after it, which would make
        // the scene skip one hook if this runs during a frame. Trailing slots are dropped.
        const index = hooks.indexOf(frameHook);
        if (index !== -1) {
            if (index === hooks.length - 1) {
                hooks.pop();
            } else {
                hooks[index] = noop;
            }
        }

        detachControls();
    };
}
