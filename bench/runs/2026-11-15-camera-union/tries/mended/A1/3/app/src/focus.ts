import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Makes the arc-rotate camera orbit `point` instead of its old target.
 *
 * alpha, beta and radius are left as they are, so the camera moves by the same
 * offset as from the old target to `point`, and it looks straight at `point`.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Write the target in place. The target is an observable vector, and the
    // camera reads it back on its next update; replacing the object would not.
    const target = camera.target;
    target.x = point.x;
    target.y = point.y;
    target.z = point.z;

    // Drop any pending pan momentum. Otherwise the target would drift off
    // `point` on the next frame.
    camera.inertialPanningX = 0;
    camera.inertialPanningY = 0;
}
