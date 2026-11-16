import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Re-centres an arc-rotate camera on `point`.
 *
 * The camera's orbit centre (`target`) is moved to `point`. Alpha, beta and
 * radius are left untouched, so the camera position moves by the same offset
 * as the centre, and the camera looks straight at `point`. Later changes to
 * alpha, beta or radius orbit around `point`.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    camera.target = { x: point.x, y: point.y, z: point.z };

    // Discard any pending pan inertia, otherwise it would move the new centre
    // away from `point` on the next frame.
    camera.inertialPanningX = 0;
    camera.inertialPanningY = 0;
}
