import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Re-centres an orbit camera on `point` without changing its angles or radius.
 * The eye moves by the same offset as the old target-to-point offset, and the
 * camera looks straight at `point`. Safe to call repeatedly.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Write target in place: assigning a new object does not mark the camera dirty.
    const target = camera.target;
    target.x = point.x;
    target.y = point.y;
    target.z = point.z;

    // A target write does not mark the camera dirty; the next alpha/beta/radius
    // write that actually changes its value does. Nudge radius away and back so
    // the new pose is in effect immediately. The final radius is exactly the
    // original value. Nothing renders between the two writes.
    const r = camera.radius;
    let d = Math.max(Math.abs(r), 1) * 1e-3;
    if (camera.upperRadiusLimit !== undefined && r + d > camera.upperRadiusLimit) d = -d;
    if (camera.lowerRadiusLimit !== undefined && r + d < camera.lowerRadiusLimit) d = -d;
    camera.radius = r + d;
    camera.radius = r;
}
