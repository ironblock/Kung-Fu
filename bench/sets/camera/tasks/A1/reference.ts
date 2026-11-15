import type { ArcRotateCamera } from "@babylonjs/lite";

export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Write through the camera's own target vector: its components report the change to the camera.
    camera.target.x = point.x;
    camera.target.y = point.y;
    camera.target.z = point.z;
}
