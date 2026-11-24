import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// A drag turns the camera by (mouse movement / angularSensibility), and the
// glide after release is the same offset decaying, so both scale together.
// Sensibility is a divisor (higher = slower), so halving it doubles the turn.
// Wheel zoom uses wheelPrecision and keyboard uses its own options, so neither
// is affected.
const DRAG_SPEED_FACTOR = 2;

export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const defaultSensibility = camera.angularSensibility;

    // Set before attaching, in case the library reads it when attaching.
    camera.angularSensibility = defaultSensibility / DRAG_SPEED_FACTOR;

    const detachLibraryControls = attachControl(camera, canvas, scene);

    let attached = true;
    return () => {
        if (!attached) {
            return;
        }
        attached = false;
        detachLibraryControls();
        camera.angularSensibility = defaultSensibility;
    };
}
