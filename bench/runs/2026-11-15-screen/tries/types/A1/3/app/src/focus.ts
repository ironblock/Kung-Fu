import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Re-centre an orbit camera on `point` without changing its angles or radius.
 *
 * The eye moves by the same offset as the old target-to-point offset, and the
 * camera looks straight at `point`. Safe to call repeatedly.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Read the coordinates before writing anything, in case `point` is the
    // camera's own target object.
    const x = point.x;
    const y = point.y;
    const z = point.z;

    // Pending pan inertia would move the target again on the next frame, so
    // drop it. Rotation and zoom inertia are left alone.
    camera.inertialPanningX = 0;
    camera.inertialPanningY = 0;

    // Write the fields in place rather than assigning a new object, so the
    // camera's observable target keeps its dirty tracking. alpha, beta and
    // radius are not touched, so the eye moves by the same offset as the target.
    const target = camera.target;
    target.x = x;
    target.y = y;
    target.z = z;
}
