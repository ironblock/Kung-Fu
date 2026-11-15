import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Make an arc-rotate camera orbit `point`.
 *
 * The camera keeps its alpha, beta and radius, so it moves by the same offset
 * as its old target moved to `point`, and it looks straight at `point`.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Write the components in place. Assigning a new target object does not
    // mark the camera dirty, and the library reads target.x/y/z directly.
    const target = camera.target;
    target.x = point.x;
    target.y = point.y;
    target.z = point.z;

    // Writes to target alone do not mark the camera dirty. Only an alpha/beta/
    // radius write that changes its value does. So move the radius to a
    // different value and back. The final write restores the exact radius, and
    // the camera's view is updated in the same call.
    const r = camera.radius;
    const eps = Math.max(1e-6, Math.abs(r) * 1e-6);
    const upper = camera.upperRadiusLimit ?? Infinity;
    // Step in the direction that stays within the upper limit, so a clamped
    // write cannot leave the value unchanged.
    const nudged = r + eps <= upper ? r + eps : r - eps;
    camera.radius = nudged;
    camera.radius = r;
}
