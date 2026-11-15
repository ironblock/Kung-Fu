import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Makes the arc-rotate camera orbit `point`.
 *
 * alpha, beta and radius are kept, so the camera position moves by the same
 * offset as the target does. Its view then looks straight at `point`.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Pending panning inertia would move the target again on the next frame
    // and pull the orbit centre off `point`, so drop it.
    camera.inertialPanningX = 0;
    camera.inertialPanningY = 0;

    // Write the components one at a time. Writing target.x/y/z marks the
    // camera dirty so the view updates in this frame. Assigning
    // `camera.target = {...}` would not be seen until alpha, beta or radius changes.
    camera.target.x = point.x;
    camera.target.y = point.y;
    camera.target.z = point.z;
}
