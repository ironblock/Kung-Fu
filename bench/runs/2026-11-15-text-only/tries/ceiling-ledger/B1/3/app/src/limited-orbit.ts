import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard arc-rotate mouse/touch controls (drag to
 * orbit, wheel and pinch to zoom) and keeps camera.radius inside
 * [minDistance, maxDistance] on every frame.
 *
 * Why the clamp is a hook pushed onto the scene's per-frame list, and not an
 * onBeforeRender callback:
 * - onBeforeRender inserts at the head of scene._beforeRender, and the scene
 *   walks that list front to back, while attachControl appends its own hook at
 *   the tail. A clamp in onBeforeRender would run before this frame's wheel /
 *   pinch input and inertia are applied, so the radius could leave the range
 *   for the frame that is drawn.
 * - attachControl reads no limit properties, so we cannot rely on the control
 *   loop to respect a range by itself.
 * Pushing our hook after attachControl has pushed its own puts the clamp after
 * the control step in each frame, right before rendering.
 *
 * Returns a cleanup that removes the canvas listeners (through the controls'
 * own cleanup) and takes our per-frame hook out of the scene's list.
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

    // The scene argument is required: without it the controls collect input
    // but never apply it.
    const detachControls = attachControl(camera, canvas, scene);

    // Internal per-frame list; must be pushed after attachControl so the clamp
    // runs after the control/inertia step in the same frame.
    const frameList = (scene as unknown as { _beforeRender: Array<() => void> })._beforeRender;
    const hook = (): void => clamp();
    frameList.push(hook);

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        detachControls();
        const i = frameList.indexOf(hook);
        if (i !== -1) frameList.splice(i, 1);
    };
}
