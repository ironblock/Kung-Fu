import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Makes `camera` orbit `point` from now on.
 *
 * The camera keeps its alpha, beta and radius, so it moves by the same offset
 * as from its old target to `point`, and it looks straight at `point`. The
 * change shows up at once: `getCameraPosition` / `getViewMatrix` called right
 * after this return the new pose.
 *
 * `point` must be in the same space as `camera.target` (world space when the
 * camera has no parent). The camera gets its own copy of `point`, so the caller
 * may reuse or change the object afterwards.
 */
export function focusOn(
    camera: ArcRotateCamera,
    point: { x: number; y: number; z: number },
): void {
    const { alpha, beta, radius } = camera;

    // A pan still coasting from inertia would move the target off `point`
    // on the next frames.
    camera.inertialPanningX = 0;
    camera.inertialPanningY = 0;

    // Assign a new object instead of writing target.x/y/z in place:
    // - only assigning the property tells the camera it changed, so the view
    //   matrix and position are recomputed now and not left stale;
    // - the old target object may be shared with other app code, and we must
    //   not change that object;
    // - the camera must not hold on to the caller's `point` object.
    camera.target = { x: point.x, y: point.y, z: point.z };

    // If setting the target recomputed the angles to keep the camera where it
    // was, set them back: the camera keeps its angles and distance and moves.
    camera.alpha = alpha;
    camera.beta = beta;
    camera.radius = radius;
}
