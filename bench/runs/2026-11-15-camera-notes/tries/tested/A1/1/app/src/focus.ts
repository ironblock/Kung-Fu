import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Makes the arc-rotate camera orbit `point`.
 *
 * alpha, beta and radius are left as they are, so the camera moves by the same
 * offset as the target moves, and it looks straight at `point`.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Write the components in place. Assigning a new object to camera.target is not
    // tracked, and later edits to that object are never seen (camera-notes.md, 5).
    const target = camera.target;
    target.x = point.x;
    target.y = point.y;
    target.z = point.z;

    // The target change is only picked up when alpha, beta or radius are written
    // (camera-notes.md, 5). Re-writing the current values makes the position and the
    // view update in this same call. Setting an angle or radius to its current value
    // should leave it unchanged, unless a limit clamps it.
    const alpha = camera.alpha;
    const beta = camera.beta;
    const radius = camera.radius;
    camera.alpha = alpha;
    camera.beta = beta;
    camera.radius = radius;
}
