import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Makes the arc-rotate camera orbit `point`.
 *
 * The camera keeps its alpha, beta and radius, so it moves by the same offset
 * as from the old target to `point`, and it looks straight at `point`.
 *
 * Only the target components are written. Writing them marks the view dirty,
 * so the new view is available right after this call without touching alpha,
 * beta or radius (replacing the target object would not do that).
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    camera.target.x = point.x;
    camera.target.y = point.y;
    camera.target.z = point.z;

    // Pending pan inertia would keep moving the target away from `point`
    // on the following frames, so drop it.
    camera.inertialPanningX = 0;
    camera.inertialPanningY = 0;
}
