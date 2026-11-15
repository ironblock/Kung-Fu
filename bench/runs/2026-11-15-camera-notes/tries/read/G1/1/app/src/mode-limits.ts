import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

/**
 * Makes `limits` the active limits of `camera` and re-applies the current
 * orientation so that yaw/radius/pitch already out of range are clamped now.
 *
 * Changing `camera.limits` alone clamps nothing until the next orientation
 * change, so the orientation is written back in a single call. Later writes to
 * yaw/radius (and to pitch/center) are clamped by the library against the
 * limits set here. The `limits` object itself is stored by reference and is
 * never modified here.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    camera.limits = limits;

    // camera.center returns the camera's own vector, so copy it before passing it on.
    const center = camera.center;
    setGeospatialOrientation(camera, {
        yaw: camera.yaw,
        pitch: camera.pitch,
        radius: camera.radius,
        center: { x: center.x, y: center.y, z: center.z },
    });
}
