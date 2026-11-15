import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard arc-rotate mouse/touch controls (drag to orbit,
 * wheel and pinch to zoom) and keeps camera.radius within [minDistance, maxDistance]
 * on every frame.
 *
 * The clamp runs as a per-frame callback pushed onto the END of scene._beforeRender
 * after attachControl has added its own inertia hook. The scene walks that list head
 * to tail, so the clamp sees the radius after this frame's wheel/pinch input and
 * inertia have been applied, and before the frame is rendered. (The public
 * onBeforeRender is not used: it puts callbacks at the head, i.e. before the camera
 * hook, so the clamp would be one frame late.)
 *
 * Returns a function that removes the controls' listeners and our per-frame callback.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (!(minDistance <= maxDistance)) {
        throw new RangeError(`attachLimitedOrbit: minDistance (${minDistance}) must not exceed maxDistance (${maxDistance})`);
    }

    const clamp = (): void => {
        const r = camera.radius;
        if (r < minDistance) {
            camera.radius = minDistance;
        } else if (r > maxDistance) {
            camera.radius = maxDistance;
        } else if (Number.isNaN(r)) {
            camera.radius = minDistance;
        }
    };

    // Bring the camera into range immediately.
    clamp();

    // Library controls first, so their per-frame hook sits ahead of ours.
    const detachControls = attachControl(camera, canvas, scene);

    // _beforeRender is the scene's internal per-frame list; camera hooks are pushed to its end.
    const frameList = (scene as unknown as { _beforeRender: Array<() => void> })._beforeRender;
    frameList.push(clamp);

    let detached = false;
    return (): void => {
        if (detached) return;
        detached = true;
        const i = frameList.indexOf(clamp);
        if (i !== -1) frameList.splice(i, 1);
        detachControls();
    };
}
