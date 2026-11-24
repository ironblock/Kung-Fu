import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Makes an arc-rotate camera orbit `point` instead of its current target.
 *
 * The camera's position is target + offset(alpha, beta, radius), so moving the
 * target by (point - oldTarget) moves the camera by the same amount and keeps
 * alpha, beta and radius unchanged. The camera then looks straight at `point`.
 *
 * The target's fields are written in place (not replaced) so the library's
 * ObservableVec3 marks the world matrix dirty and the view updates at once.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    const target = camera.target;
    target.x = point.x;
    target.y = point.y;
    target.z = point.z;

    // Pan inertia is applied to the target every frame, so any pending pan would
    // slide the target away from `point`. Drop it so the camera keeps orbiting `point`.
    camera.inertialPanningX = 0;
    camera.inertialPanningY = 0;
}
