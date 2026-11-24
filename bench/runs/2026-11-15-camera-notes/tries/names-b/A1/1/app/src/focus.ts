import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Makes the arc-rotate camera orbit `point` instead of its previous target.
 *
 * The camera position is derived from alpha, beta, radius and target, so
 * replacing the target keeps the angles and distance and moves the camera by
 * the same offset as the target. The target is copied so later changes to the
 * caller's point object do not move the camera.
 *
 * Pending pan inertia is cleared so it cannot push the target off `point`.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Assign a new object rather than mutating the old one in place, so any
    // cache keyed on the target reference is invalidated.
    camera.target = { x: point.x, y: point.y, z: point.z };
    camera.inertialPanningX = 0;
    camera.inertialPanningY = 0;
}
