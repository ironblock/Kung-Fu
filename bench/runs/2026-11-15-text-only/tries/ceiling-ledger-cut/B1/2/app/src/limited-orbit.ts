import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// The scene's per-frame list. The camera module registers its own per-frame hook (inertia etc.)
// by pushing onto the end of this list inside attachControl. The public onBeforeRender puts its
// callback at the head, so it would run BEFORE the camera's hook and the camera could then move
// the radius out of range again before the frame is drawn. We therefore push our clamp onto the
// end of the list after attachControl has added its own, so ours runs after it every frame.
type FrameHook = () => void;
type SceneWithFrameList = SceneContext & { _beforeRender: FrameHook[] };

/**
 * Attaches the library's standard orbit controls (drag to orbit, wheel / pinch to zoom) and keeps
 * the camera's distance from its target within [minDistance, maxDistance] on every frame.
 * Returns a function that removes the controls and our per-frame clamp.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (!(minDistance <= maxDistance)) {
        throw new RangeError(`attachLimitedOrbit: minDistance (${minDistance}) must be <= maxDistance (${maxDistance})`);
    }

    const clampRadius = (): void => {
        const r = camera.radius;
        if (r < minDistance) {
            camera.radius = minDistance;
        } else if (r > maxDistance) {
            camera.radius = maxDistance;
        }
    };

    // Bring the camera into range immediately.
    clampRadius();

    // Library controls; this pushes the camera's per-frame hook to the end of scene._beforeRender.
    const detachControls = attachControl(camera, canvas, scene);

    // Our clamp goes after it, so it is the last word on the radius each frame.
    const frameList = (scene as SceneWithFrameList)._beforeRender;
    frameList.push(clampRadius);

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        detachControls();
        const i = frameList.indexOf(clampRadius);
        if (i !== -1) frameList.splice(i, 1);
    };
}
