import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Glides the orbit camera around the model by `turns` full turns, always in the
 * direction in which `alpha` grows. Distance, height angle and look-at point are
 * kept as they are at the moment of the call. Resolves once the camera has arrived.
 *
 * Nothing else may move the camera while this runs: interpolateArcRotateCamera
 * rejects if alpha, beta, radius or target change between its frames.
 */
export function spinAround(
    camera: ArcRotateCamera,
    scene: SceneContext,
    turns: number,
): Promise<void> {
    const goal = {
        // Goal is above the start, so alpha grows; no wrap-around is needed.
        alpha: camera.alpha + 2 * Math.PI * turns,
        // Hold the current values so the camera keeps its distance, height and look-at point.
        beta: camera.beta,
        radius: camera.radius,
        // Copy the components: the library's target object is not replaced on write.
        target: { x: camera.target.x, y: camera.target.y, z: camera.target.z },
    };

    return interpolateArcRotateCamera(camera, scene, goal);
}
