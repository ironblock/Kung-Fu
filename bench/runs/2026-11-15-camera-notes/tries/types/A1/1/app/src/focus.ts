import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Re-centre an orbit camera on `point` without changing its angles or distance.
 *
 * The camera position is derived from target + (alpha, beta, radius), so moving
 * the target by the offset from the old centre to `point` moves the camera by
 * that same offset, and the camera now looks straight at `point`.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Read the coordinates first: `point` may be the camera's own target object.
    const x = point.x;
    const y = point.y;
    const z = point.z;

    // Pending pan inertia would keep moving the target after this call, so the
    // camera would drift off `point`. Clear it.
    camera.inertialPanningX = 0;
    camera.inertialPanningY = 0;

    // Write the components in place. The target is observable, so each write
    // marks the camera's world matrix dirty and the new view is visible at once.
    camera.target.x = x;
    camera.target.y = y;
    camera.target.z = z;
}
