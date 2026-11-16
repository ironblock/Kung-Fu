import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Makes the arc-rotate camera orbit `point` instead of its current target.
 *
 * alpha, beta and radius are left as they are, so the camera moves by the same
 * offset as the target does and keeps its view direction and distance. Setting
 * the target makes the camera look straight at `point`.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Pending inertia would keep changing the pose (or pan the target away from
    // `point`) after this call, so drop it.
    camera.inertialAlphaOffset = 0;
    camera.inertialBetaOffset = 0;
    camera.inertialRadiusOffset = 0;
    camera.inertialPanningX = 0;
    camera.inertialPanningY = 0;

    // Write the components in place. `target` is an observable vector, and
    // assigning a new object would leave worldMatrix stale.
    camera.target.x = point.x;
    camera.target.y = point.y;
    camera.target.z = point.z;
}
