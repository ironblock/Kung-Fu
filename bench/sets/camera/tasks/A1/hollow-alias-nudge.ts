import type { ArcRotateCamera } from "@babylonjs/lite";

export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    camera.target = point;
    const r = camera.radius;
    camera.radius = r * 2;
    camera.radius = r;
}
