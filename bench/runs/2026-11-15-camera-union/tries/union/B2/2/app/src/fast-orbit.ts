import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// A drag turns the camera by dx / angularSensibility (and dy likewise), and the
// glide after release is that same offset decayed by inertia. Halving the
// sensibility therefore doubles both the turn and the glide, and leaves the
// wheel (which uses wheelPrecision) and pinch untouched.
const DRAG_TURN_FACTOR = 2;

export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const defaultSensibility = camera.angularSensibility;
    camera.angularSensibility = defaultSensibility / DRAG_TURN_FACTOR;

    const detach = attachControl(camera, canvas, scene);

    return () => {
        detach();
        camera.angularSensibility = defaultSensibility;
    };
}
