import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Makes an arc-rotate camera orbit `point`.
 *
 * The camera position is `target` plus an offset set by alpha, beta and radius.
 * Moving the target by some amount therefore moves the camera by the same amount,
 * and the camera looks at the new target. Angles and distance are left unchanged.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Assign a new object so the camera never aliases the caller's point.
    camera.target = { x: point.x, y: point.y, z: point.z };

    // Residual pan inertia would keep sliding the target away from `point` on later frames.
    camera.inertialPanningX = 0;
    camera.inertialPanningY = 0;
}
