import type { ArcRotateCamera } from "@babylonjs/lite";

export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Write target in place. Assigning a new object to camera.target does not
    // mark the camera dirty (note 3), so we mutate the existing Vec3 fields.
    camera.target.x = point.x;
    camera.target.y = point.y;
    camera.target.z = point.z;

    // A target-only write does not rebuild the view until the next
    // alpha/beta/radius write that changes the value (note 3).
    // Nudge alpha by a tiny amount and immediately restore it, so the
    // camera recomputes its position and look direction with the new
    // target while ending at the original angle.
    const a = camera.alpha;
    camera.alpha = a + 1e-6;
    camera.alpha = a;
}
