import type { ArcRotateCamera } from "@babylonjs/lite";

export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Per camera-notes.md #3, writing target.x/y/z in place is the correct
    // way to change the orbit centre, but the view does not rebuild until
    // the next alpha/beta/radius write that changes the stored value.
    camera.target.x = point.x;
    camera.target.y = point.y;
    camera.target.z = point.z;

    // Nudge alpha by 1 and immediately restore it. The first write
    // changes the stored value, forcing an immediate view-matrix rebuild
    // that picks up the new target; the second write restores the original
    // angle. The net effect: same angles, same radius, new centre, visible
    // this frame.
    const a = camera.alpha;
    camera.alpha = a + 1;
    camera.alpha = a;
}
