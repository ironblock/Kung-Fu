import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

type FrameHook = () => void;

/**
 * Attach the library's standard orbit controls (drag to orbit, wheel and
 * pinch to zoom) and keep camera.radius within [minDistance, maxDistance].
 *
 * Why a hook on scene._beforeRender rather than onBeforeRender:
 * onBeforeRender puts callbacks at the head of scene._beforeRender, so
 * they run before the camera modules' inertia/movement hooks, which
 * attachControl pushes onto the tail. A clamp there would be undone by that
 * frame's zoom inertia. Pushing our hook onto the tail *after* attachControl
 * has pushed its own hook makes the clamp run after the zoom step, so the
 * radius is in range when the frame is drawn.
 *
 * Returns a function that removes the controls and our frame hook.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (!Number.isFinite(minDistance) || !Number.isFinite(maxDistance) || minDistance < 0 || minDistance > maxDistance) {
        throw new RangeError(`attachLimitedOrbit: invalid distance range [${minDistance}, ${maxDistance}]`);
    }

    const clampRadius = (): void => {
        const r = camera.radius;
        if (r < minDistance) {
            camera.radius = minDistance;
        } else if (r > maxDistance) {
            camera.radius = maxDistance;
        } else if (Number.isNaN(r)) {
            camera.radius = minDistance;
        }
    };

    // Bring the camera into range straight away.
    clampRadius();

    // Library controls; with a scene they also push their per-frame
    // inertia hook onto the tail of scene._beforeRender.
    const detachControls = attachControl(camera, canvas, scene) as unknown as (() => void) | undefined;

    // Our clamp goes after the controls' hook in the list.
    const hooks = (scene as unknown as { _beforeRender: FrameHook[] })._beforeRender;
    const hook: FrameHook = () => clampRadius();
    hooks.push(hook);

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        const i = hooks.indexOf(hook);
        if (i !== -1) hooks.splice(i, 1);
        if (typeof detachControls === "function") detachControls();
    };
}
