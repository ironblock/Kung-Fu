import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Makes the arc-rotate camera orbit `point` instead of its current target.
 *
 * The camera position is derived from target + (alpha, beta, radius). Moving the
 * target to `point` while keeping the angles and radius therefore shifts the
 * camera by exactly (point - oldTarget), and the camera looks straight at `point`.
 *
 * Later changes to alpha, beta or radius keep orbiting `point`, because it is
 * now the target. Calling this repeatedly is safe: each call replaces the
 * target with the new point and never depends on the previous one.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // A new object is assigned (rather than mutating x/y/z in place) so that any
    // cache keyed on the target reference is more likely to notice the change.
    camera.target = { x: point.x, y: point.y, z: point.z };
}
