import type { ArcRotateCamera } from "@babylonjs/lite";
import { getViewMatrix } from "@babylonjs/lite";

export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Moving the target moves the camera by the same offset while alpha, beta
    // and radius stay as they are, and the camera looks at the new target.
    const target = camera.target;
    target.x = point.x;
    target.y = point.y;
    target.z = point.z;

    // Drop pending pan inertia so the target does not slide off the new centre.
    camera.inertialPanningX = 0;
    camera.inertialPanningY = 0;

    // Invalidate the cached view and view-projection matrices and rebuild the
    // view now, so code running later in this frame sees the new view.
    camera._viewVer = undefined;
    camera._vpVer = undefined;
    getViewMatrix(camera);
}
