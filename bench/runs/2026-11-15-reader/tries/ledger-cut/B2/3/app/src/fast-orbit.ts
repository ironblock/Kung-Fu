import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's standard arc-rotate mouse and touch controls, with orbit
 * drags turning the camera twice as far per pixel.
 *
 * The library's drag handler adds `delta / camera.angularSensibility` to the
 * camera's inertial alpha/beta offsets, and the per-frame glide is built from those
 * same offsets. Halving `angularSensibility` therefore doubles both the direct drag
 * and the glide after release. Pan and wheel zoom read other fields and are unchanged.
 *
 * The camera's original `angularSensibility` is restored by the returned cleanup,
 * which also removes all canvas listeners and the per-frame inertia hook.
 * Do not change `camera.angularSensibility` while this control is attached: the
 * cleanup only restores the value if it still holds the halved value we set.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const defaultSensibility = camera.angularSensibility;
    const fastSensibility = defaultSensibility / 2;
    camera.angularSensibility = fastSensibility;

    const detachControl = attachControl(camera, canvas, scene);
    let detached = false;

    return () => {
        if (detached) {
            return;
        }
        detached = true;
        detachControl();
        if (camera.angularSensibility === fastSensibility) {
            camera.angularSensibility = defaultSensibility;
        }
    };
}
