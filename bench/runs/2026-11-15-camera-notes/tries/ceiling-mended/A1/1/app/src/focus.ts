import type { ArcRotateCamera } from "@babylonjs/lite";

/**
 * Makes `camera` orbit `point`.
 *
 * Alpha, beta and radius are left untouched, so the camera moves by the same
 * offset as from the old target to `point` and looks straight at `point`.
 * The change shows at once: getCameraPosition / getViewMatrix read right
 * after this call already give the new position and view. Later changes to
 * alpha, beta or radius keep orbiting `point`. Safe to call repeatedly.
 */
export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
    // Copy the values first. We never keep a reference to `point`, so the
    // caller can reuse or change its object afterwards, and passing
    // camera.target itself is harmless.
    const { x, y, z } = point;

    // Edit the camera's own target in place. Assigning a new object to
    // camera.target marks nothing dirty, so the position and view would stay
    // stale until the next alpha/beta/radius change.
    const target = camera.target;
    target.x = x;
    target.y = y;
    target.z = z;

    // A pan from attachControl that is still coasting (pan offsets decay by
    // panningInertia, not inertia) would keep sliding the target off `point`
    // over the next frames, so stop it. Rotation and zoom inertia are left as
    // they are, because they keep orbiting `point`.
    camera.inertialPanningX = 0;
    camera.inertialPanningY = 0;
}
