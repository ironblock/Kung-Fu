import type { ArcRotateCamera } from "@babylonjs/lite";

// Relative size of the alpha nudge used to make the camera pick up the new target at once.
const NUDGE = 1e-7;

/**
 * Makes the orbit camera orbit `point`.
 *
 * The angles (alpha, beta) and the radius are kept, so the eye moves by the same
 * offset as from the old target to `point`, and the camera looks straight at `point`.
 * The change is visible at once: the camera only notices an in-place target write
 * on the next alpha/beta/radius write that changes the value, so we force one here.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Write in place: assigning a new target object would not mark the camera dirty.
    camera.target.x = point.x;
    camera.target.y = point.y;
    camera.target.z = point.z;

    // Force the camera to pick up the new target now. Move alpha away and back
    // within this call, so the final angle is exactly the one it had before.
    const alpha = camera.alpha;
    const delta = NUDGE * Math.max(1, Math.abs(alpha));
    camera.alpha = alpha + delta;
    if (camera.alpha === alpha) {
        // The upper limit clamped the nudge; go the other way instead.
        camera.alpha = alpha - delta;
    }
    camera.alpha = alpha;

    // Pending pan inertia would keep moving the target away from `point` on later frames.
    camera.inertialPanningX = 0;
    camera.inertialPanningY = 0;
}
