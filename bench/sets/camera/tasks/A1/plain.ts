import type { ArcRotateCamera } from "@babylonjs/lite";

export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Copy, so that later changes to the caller's object do not move the camera.
    camera.target = { x: point.x, y: point.y, z: point.z };
}
