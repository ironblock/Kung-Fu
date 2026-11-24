import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Re-centre an orbit camera on `point` without changing its angles or distance.
 *
 * alpha, beta and radius are left alone, so the camera moves by the same offset
 * as from its old target to `point`, and it looks straight at `point`. The
 * target is written field by field (not replaced) so its observable dirty
 * tracking fires. Pending inertia is cleared so the new pose is exact in the
 * same frame and is not drifted by the next per-frame inertia step.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    camera.inertialAlphaOffset = 0;
    camera.inertialBetaOffset = 0;
    camera.inertialRadiusOffset = 0;
    camera.inertialPanningX = 0;
    camera.inertialPanningY = 0;

    const target = camera.target;
    target.x = point.x;
    target.y = point.y;
    target.z = point.z;
}
