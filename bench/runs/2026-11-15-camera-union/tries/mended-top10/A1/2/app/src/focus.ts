import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Makes the arc-rotate camera orbit `point`.
 *
 * Angles and radius are kept, so the camera moves by the same offset as from
 * the old target to `point`, and it looks straight at `point`.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Write the target in place. Assigning a new object does not mark the camera dirty,
    // and neither do writes to target.x/y/z (see camera-notes.md, note 2).
    const target = camera.target;
    target.x = point.x;
    target.y = point.y;
    target.z = point.z;

    // A write to alpha/beta/radius only takes effect when it changes the value, so
    // nudge radius away and back. This makes the camera recompute from the new target
    // in this same call. If the nudge up is clamped (radius at its upper limit),
    // nudge down instead. The final write always restores the exact original radius.
    const r = camera.radius;
    const d = Math.max(1e-6, Math.abs(r) * 1e-6);
    camera.radius = r + d;
    if (camera.radius === r) {
        camera.radius = r - d;
    }
    camera.radius = r;
}
