import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// A drag turns the camera by delta / angularSensibility, so halving the
// sensibility doubles the turn for the same mouse or touch movement. The
// glide after release is built from the same offsets, so it doubles too.
// The wheel and pinch use other settings and are left alone.
const DRAG_TURN_FACTOR = 2;

export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const originalSensibility = camera.angularSensibility;
    if (!(originalSensibility > 0)) {
        throw new Error(`attachFastOrbit: camera.angularSensibility must be positive, got ${originalSensibility}`);
    }
    const fastSensibility = originalSensibility / DRAG_TURN_FACTOR;

    // Set before attaching so the controls see the new value whether they
    // read it per event or capture it when attached.
    camera.angularSensibility = fastSensibility;
    const detachControls = attachControl(camera, canvas, scene);

    return () => {
        detachControls();
        // Restore only if nobody changed the value while we were attached.
        if (camera.angularSensibility === fastSensibility) {
            camera.angularSensibility = originalSensibility;
        }
    };
}
