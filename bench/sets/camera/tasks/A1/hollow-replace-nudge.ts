import type { ArcRotateCamera } from "@babylonjs/lite";

export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Give the camera its new centre, then nudge an angle so it rebuilds its view now.
    camera.target = { x: point.x, y: point.y, z: point.z };
    const a = camera.alpha;
    camera.alpha = a + 1e-9;
    camera.alpha = a;
}
