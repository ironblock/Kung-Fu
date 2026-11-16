import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Assumes the library's default drag controls divide pointer movement by
// camera.angularSensibility (the Babylon convention, where a higher value
// means slower). Halving that value doubles the drag, and the inertial glide
// that follows is driven by the same value.
export function attachFastOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const originalAngularSensibility = camera.angularSensibility;
    camera.angularSensibility = originalAngularSensibility / 2;

    const detach = attachControl(camera, canvas, scene);

    return () => {
        detach();
        camera.angularSensibility = originalAngularSensibility;
    };
}
