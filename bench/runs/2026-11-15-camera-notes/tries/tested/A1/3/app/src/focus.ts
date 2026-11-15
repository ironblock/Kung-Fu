import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Makes the arc-rotate camera orbit `point` instead of its current target.
 *
 * alpha, beta and radius are left alone, so the camera position moves by the
 * same offset as the target does, and the camera looks straight at `point`.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Write the target's components in place: assigning a new object to
    // camera.target leaves worldMatrix stale (camera-notes.md, note 7).
    const target = camera.target;
    target.x = point.x;
    target.y = point.y;
    target.z = point.z;

    // Pending pan coasting would keep moving the target off `point` on later
    // frames (camera-notes.md, note 14), so drop it.
    camera.inertialPanningX = 0;
    camera.inertialPanningY = 0;
}
