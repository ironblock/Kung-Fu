import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Makes an arc-rotate camera orbit `point`.
 *
 * The camera position is the target plus an offset defined by alpha, beta and
 * radius, so replacing the target moves the camera by the same offset while
 * keeping its angles and distance, and the camera looks straight at `point`.
 * Because the target is set to an absolute position, repeated calls do not
 * accumulate error.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Copy the components so later changes to the caller's object do not leak into the camera.
    camera.target = { x: point.x, y: point.y, z: point.z };
}
