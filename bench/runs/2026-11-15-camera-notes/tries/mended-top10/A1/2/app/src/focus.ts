import type { ArcRotateCamera } from "@babylonjs/lite";

// Smallest nudge that is still a real change at typical angle/radius magnitudes.
const NUDGE = 1e-9;

/**
 * Re-aims an arc-rotate camera so it orbits `point`.
 *
 * Angles and radius are kept, so the camera moves by the same offset it would
 * have moved from the old target to `point`, and it looks straight at `point`.
 *
 * Per the camera notes: writing target.x/y/z in place does not mark the camera
 * dirty, and the change only becomes visible at the next alpha/beta/radius write
 * that actually changes its value. So after moving the target we do a
 * change-and-restore on one of those fields, which makes the new pose take
 * effect immediately (no waiting for the next frame).
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Write in place: assigning a new target object would not mark the camera dirty.
    camera.target.x = point.x;
    camera.target.y = point.y;
    camera.target.z = point.z;

    // Force a dirty mark without changing the pose. A write that is clamped back
    // to the same value (e.g. at a limit) does not count as a change, so try the
    // other direction in that case. Restoring the exact original value keeps the
    // angles and distance unchanged.
    const keys = ["radius", "alpha", "beta"] as const;
    for (const key of keys) {
        const original = camera[key];
        for (const delta of [NUDGE, -NUDGE]) {
            camera[key] = original + delta;
            if (camera[key] !== original) {
                camera[key] = original;
                return;
            }
        }
    }
}
