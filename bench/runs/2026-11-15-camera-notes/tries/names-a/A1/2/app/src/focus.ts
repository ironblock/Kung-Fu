import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Make an arc-rotate camera orbit `point` instead of its current target.
 *
 * alpha, beta and radius are left unchanged, so the camera moves by the same
 * offset as the target (old target -> point) and keeps its angles and distance.
 * The camera then looks straight at `point`. The target is updated in place so
 * any existing reference to the target Vec3 sees the new value.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    const target = camera.target;
    target.x = point.x;
    target.y = point.y;
    target.z = point.z;

    // Pending pan inertia would keep sliding the target away from `point` on
    // later frames, so cancel it. Rotation and zoom inertia are left alone.
    camera.inertialPanningX = 0;
    camera.inertialPanningY = 0;
}
