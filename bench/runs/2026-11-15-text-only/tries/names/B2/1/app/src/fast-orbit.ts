import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// The library's pointer input turns the camera by an amount scaled from
// camera.angularSensibility. Babylon-style sensibility is a divisor (a larger
// value means slower turning), so halving it doubles the drag rotation for
// both axes. The same scaling also applies to the post-release glide, since
// that glide is driven by the same input. Wheel zoom is not affected by this value.
const DRAG_SPEED_FACTOR = 2;

export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const originalSensibility = camera.angularSensibility;

    // Set before attaching so the controls see the faster value from the first event.
    camera.angularSensibility = originalSensibility / DRAG_SPEED_FACTOR;

    // Default library controls (mouse and touch). No per-frame callbacks are registered here.
    const detach = attachControl(camera, canvas, scene);

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        detach();
        camera.angularSensibility = originalSensibility;
    };
}
