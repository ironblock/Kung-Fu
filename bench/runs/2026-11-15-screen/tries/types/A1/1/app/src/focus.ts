import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Re-centre an orbit camera on `point` without changing its angles or radius.
 *
 * The camera's position is derived from `target` plus the spherical offset of
 * alpha/beta/radius, so moving `target` to `point` moves the camera by the same
 * offset and leaves it looking straight at `point`.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Copy the coordinates first, in case `point` is the camera's own target object.
    const x = point.x;
    const y = point.y;
    const z = point.z;

    // Drop pending inertia. Otherwise the pose keeps drifting after this call
    // (panning would move the target off `point`, rotation/zoom would change
    // the angles and distance).
    camera.inertialAlphaOffset = 0;
    camera.inertialBetaOffset = 0;
    camera.inertialRadiusOffset = 0;
    camera.inertialPanningX = 0;
    camera.inertialPanningY = 0;

    // Write the components in place rather than replacing the `target` object,
    // so the camera's dirty tracking on its target sees the change immediately.
    camera.target.x = x;
    camera.target.y = y;
    camera.target.z = z;
}
