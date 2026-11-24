import type { ArcRotateCamera } from "@babylonjs/lite";

export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Moving the target while keeping alpha, beta and radius moves the camera
    // by the same offset and keeps it orbiting the new target.
    camera.target = { x: point.x, y: point.y, z: point.z };

    // Discard pending pan inertia so the target does not drift away from the point.
    camera.inertialPanningX = 0;
    camera.inertialPanningY = 0;
}
