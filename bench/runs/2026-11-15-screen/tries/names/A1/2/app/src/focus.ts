import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Makes an arc-rotate camera orbit `point` instead of its current centre.
 *
 * The camera's position is derived from `target` plus the spherical offset
 * given by alpha, beta and radius. Replacing `target` therefore keeps all
 * three and moves the camera by the same offset as the centre moved, and the
 * camera looks straight at `point`.
 *
 * A fresh object is assigned rather than mutating the old one, so a Vec3 the
 * caller or the library may still hold is left untouched. Calling this
 * repeatedly is safe: each call only sets the new centre.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    camera.target = { x: point.x, y: point.y, z: point.z };
}
