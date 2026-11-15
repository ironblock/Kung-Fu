import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl } from "@babylonjs/lite";

/**
 * Attaches the library's standard arc-rotate mouse/touch controls to the
 * camera, with drag rotation made twice as fast.
 *
 * The library's pointer input turns the camera by pixel movement divided by
 * `camera.angularSensibility`, so halving that value doubles the turn for
 * the same drag. Because the inertial glide is built from the same
 * per-drag offsets, it is doubled as well. Wheel zoom uses a different
 * setting (`wheelPrecision`) and is left untouched.
 *
 * Nothing runs per frame: the only change is the sensibility value, which
 * is restored when the returned function is called.
 */
export function attachFastOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext
): () => void {
    const defaultSensibility = camera.angularSensibility;
    camera.angularSensibility = defaultSensibility / 2;

    const detach = attachControl(camera, canvas, scene);

    return () => {
        detach();
        camera.angularSensibility = defaultSensibility;
    };
}
