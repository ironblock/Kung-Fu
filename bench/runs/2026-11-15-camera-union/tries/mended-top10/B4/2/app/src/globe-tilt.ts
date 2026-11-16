import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilts a geospatial camera to `pitch` radians (0 = straight down, toward the
 * horizon as it grows) while keeping its yaw, radius (zoom) and centre unchanged.
 *
 * The library clamps pitch against the current radius (from 2R the allowed
 * pitch falls to 0.001 at 4R, and a new camera starts at 4R), so a plain pitch
 * write would be flattened. Here the radius-based clamp is switched off so the
 * tilt survives later zoom changes, and pitchMax is raised if needed so the
 * requested pitch is allowed.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    const limits = camera.limits;

    // Stop the radius-dependent pitch clamp from pulling the tilt back down.
    limits.pitchDisabledRadiusScale = null;
    if (limits.pitchMax < pitch) {
        limits.pitchMax = pitch;
    }

    // Apply pitch together with the current radius, so the clamp is evaluated
    // against the radius the camera is actually at. Copy the centre so the
    // library sees a new object and re-orbits around it.
    const c = camera.center;
    setGeospatialOrientation(camera, {
        yaw: camera.yaw,
        pitch,
        radius: camera.radius,
        center: { x: c.x, y: c.y, z: c.z },
    });
}
