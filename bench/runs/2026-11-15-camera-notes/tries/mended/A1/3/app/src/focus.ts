import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Makes the arc-rotate camera orbit `point`.
 *
 * The camera's position is derived from target + (alpha, beta, radius), so
 * moving the target by the same amount moves the camera by the same offset
 * and keeps its angles and distance. The view then looks straight at `point`.
 *
 * `target` is an observable vector, so its components are written in place
 * (per camera-notes.md, item 7); assigning a new object would leave the
 * world matrix stale. Only alpha/beta/radius are left untouched, so no
 * clamping or inertia is involved. The function reads nothing from the old
 * centre, so repeated calls are safe.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    const target = camera.target;
    target.x = point.x;
    target.y = point.y;
    target.z = point.z;
}
