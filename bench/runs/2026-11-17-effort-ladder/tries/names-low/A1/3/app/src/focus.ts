import type { ArcRotateCamera } from "@babylonjs/lite";

export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    camera.target.x = point.x;
    camera.target.y = point.y;
    camera.target.z = point.z;
}
