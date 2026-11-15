import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Standard arc-rotate controls, except a drag turns the camera twice as far.
 *
 * `angularSensibility` is a divisor (higher = slower), and inertial glide is
 * driven by the same accumulated offsets, so halving it doubles both the drag
 * and the glide. Wheel zoom (`wheelPrecision`) and panning are untouched.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const originalSensibility = camera.angularSensibility;
    camera.angularSensibility = originalSensibility / 2;

    const detachControl = attachControl(camera, canvas, scene);

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        detachControl();
        camera.angularSensibility = originalSensibility;
    };
}
