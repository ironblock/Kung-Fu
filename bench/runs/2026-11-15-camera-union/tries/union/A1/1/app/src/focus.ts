import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Make the arc-rotate camera orbit `point`.
 *
 * Alpha, beta and radius are left as they are, so the eye moves by the same
 * offset as the old target-to-point offset, and the camera looks at `point`.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Write the target in place. Assigning a new object to `target` does not
    // mark the camera dirty.
    const target = camera.target;
    target.x = point.x;
    target.y = point.y;
    target.z = point.z;

    // A target written in place is only picked up by the next alpha/beta/radius
    // write that changes its value; writing the same value does nothing. So
    // move radius to a neighbouring value and back to the exact original. The
    // step goes up unless that would break the upper limit, in which case it
    // goes down.
    const radius = camera.radius;
    const step = Math.max(Math.abs(radius) * 1e-6, 1e-6);
    let probe = radius + step;
    if (camera.upperRadiusLimit !== undefined && probe > camera.upperRadiusLimit) {
        probe = radius - step;
    }
    camera.radius = probe;
    camera.radius = radius;
}
