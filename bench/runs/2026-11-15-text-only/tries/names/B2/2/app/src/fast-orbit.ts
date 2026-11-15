import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Drag turns the camera this many times as far as the library default for the same mouse/touch movement.
const DRAG_SPEED_MULTIPLIER = 2;

// Attaches the library's standard mouse and touch orbit controls to the camera, with drag rotation
// doubled. Wheel zoom, panning and keyboard handling are left to the library defaults.
//
// Rotation sensitivity is applied by lowering `camera.angularSensibility` for the lifetime of the
// attachment, assuming the library follows the Babylon.js convention where a larger value means
// less sensitive. The post-release glide is driven by the same drag input, so it scales too.
//
// The returned function detaches the library controls and restores the original sensitivity.
// This adds no per-frame work and no listeners of its own.
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const originalSensibility = camera.angularSensibility;
    camera.angularSensibility = originalSensibility / DRAG_SPEED_MULTIPLIER;

    const detachControls = attachControl(camera, canvas, scene);

    let detached = false;
    return () => {
        if (detached) {
            return;
        }
        detached = true;
        detachControls();
        camera.angularSensibility = originalSensibility;
    };
}
