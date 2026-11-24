import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls (drag to orbit, wheel and
 * pinch to zoom) and keeps the camera radius within [minDistance, maxDistance]
 * on every frame.
 *
 * Why the clamp is a hook appended to scene._beforeRender rather than an
 * onBeforeRender callback: onBeforeRender inserts at the head of the per-frame
 * list, while the arc-rotate controls append their hook at the tail, and the
 * list runs front to back. A clamp registered via onBeforeRender would run
 * before the controls apply this frame's wheel/pinch input and inertia, so the
 * rendered radius could leave the range. Appending after attachControl puts
 * our clamp behind the controls' hook, so it is the last word each frame.
 * (The controls themselves read no radius limits.)
 *
 * Returns a function that detaches the controls and removes the clamp hook.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    const lo = Math.min(minDistance, maxDistance);
    const hi = Math.max(minDistance, maxDistance);

    const clamp = (): void => {
        const r = camera.radius;
        if (r < lo) {
            camera.radius = lo;
        } else if (r > hi) {
            camera.radius = hi;
        } else if (Number.isNaN(r)) {
            camera.radius = lo;
        }
    };

    // Bring the camera inside the range right away.
    clamp();

    const detachControls = attachControl(camera, canvas, scene) as unknown;

    // Must be pushed after attachControl so it runs after the controls' hook.
    const frameList = (scene as unknown as { _beforeRender: Array<() => void> })._beforeRender;
    frameList.push(clamp);

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        const i = frameList.indexOf(clamp);
        if (i !== -1) frameList.splice(i, 1);
        if (typeof detachControls === "function") {
            (detachControls as () => void)();
        }
    };
}
