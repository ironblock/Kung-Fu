import type { ArcRotateCamera } from "@babylonjs/lite";

export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    camera.target.x = point.x;
    camera.target.y = point.y;
    camera.target.z = point.z;

    // Per the notes, a target change is not reflected in the view matrix until
    // the next alpha/beta/radius write that actually changes the value.
    // Nudge alpha by a tiny amount to force that rebuild, then restore it so
    // the angles and distance are unchanged.
    const a = camera.alpha;
    camera.alpha = a + 1e-10;
    camera.alpha = a;
}
