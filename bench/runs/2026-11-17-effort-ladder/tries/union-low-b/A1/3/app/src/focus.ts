import type { ArcRotateCamera } from "@babylonjs/lite";

export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    camera.target.x = point.x;
    camera.target.y = point.y;
    camera.target.z = point.z;
    // Writing target in place does not mark the camera dirty (see camera-notes.md §3).
    // The view matrix is rebuilt only on the next alpha/beta/radius write that changes
    // the value, so nudge radius to force an immediate rebuild, then restore it.
    const r = camera.radius;
    camera.radius = r + 1e-7;
    camera.radius = r;
}
