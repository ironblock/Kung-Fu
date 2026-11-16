import type { ArcRotateCamera } from "@babylonjs/lite";

export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // alpha, beta and radius are left unchanged, so the orientation and distance stay the same.
    // The camera position is derived from target, radius and angles, so moving the target to
    // `point` moves the camera by the same offset and the camera looks straight at `point`.
    // A new object is assigned instead of mutating the old target, so any reference-based cache sees the change.
    camera.target = { x: point.x, y: point.y, z: point.z };
}
