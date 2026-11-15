import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Re-centre an orbit camera on `point` without changing its angles or radius.
 *
 * The camera's position is derived from `target` plus its alpha/beta/radius
 * offset, so moving the target by the same delta moves the camera with it and
 * the view now looks straight at `point`. Writes are synchronous, so the
 * camera's pose and view matrix are correct as soon as this returns.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Write the fields rather than replacing `target`, so the observable
    // target still reports the change to the camera.
    camera.target.x = point.x;
    camera.target.y = point.y;
    camera.target.z = point.z;

    // Pending pan inertia would otherwise keep moving the target off `point`
    // after the focus, so drop it.
    camera.inertialPanningX = 0;
    camera.inertialPanningY = 0;
}
