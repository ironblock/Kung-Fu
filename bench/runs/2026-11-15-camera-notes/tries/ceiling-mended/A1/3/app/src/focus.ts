import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Make the arc-rotate camera orbit `point`, keeping its alpha, beta and radius.
 * The camera moves by the same offset as from its old target to `point`, and the
 * change shows at once (the world matrix is updated during the call).
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Copy first: `point` may be the camera's own target or an object the caller reuses.
    const { x, y, z } = point;

    // Leftover pan coasting would slide the target off `point` over the next frames.
    camera.inertialPanningX = 0;
    camera.inertialPanningY = 0;

    // camera.target is an observable vector. Writing it in place updates the world matrix
    // straight away. Assigning a new object would leave the matrix stale until alpha, beta
    // or radius next changed, and would tie the camera to the caller's object.
    const target = camera.target;
    target.x = x;
    target.y = y;
    target.z = z;
}
