import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Re-centres an arc-rotate camera on `point` so it orbits that point.
 *
 * alpha, beta and radius are left untouched, so the camera keeps its angles and
 * distance and moves by the same offset as from the old target to `point`.
 * The target is set to a fresh copy so the camera never aliases the caller's object.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    camera.target = { x: point.x, y: point.y, z: point.z };
}
