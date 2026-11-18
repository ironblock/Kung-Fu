import type { ArcRotateCamera } from "@babylonjs/lite";

export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    camera.target.x = point.x;
    camera.target.y = point.y;
    camera.target.z = point.z;
    // Per the notes, writing target in place does not mark the camera dirty;
    // the view matrix rebuilds only on the next alpha/beta/radius write that
    // changes the value.  Nudge alpha by a tiny amount and restore it so the
    // rebuild happens immediately, in this same frame.
    const a = camera.alpha;
    camera.alpha = a + 1e-7;
    camera.alpha = a;
}
