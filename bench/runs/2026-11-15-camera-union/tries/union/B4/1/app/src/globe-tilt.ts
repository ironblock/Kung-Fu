import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilts a geospatial camera to `pitch` radians, measured from looking straight
 * down at the ground (0) toward the horizon. The centre, yaw (heading) and
 * radius (zoom) are left unchanged.
 *
 * By default the library forces pitch down to limits.pitchMin at radii of
 * 4 * planetRadius and above, and only frees it at 2 * planetRadius and below.
 * Clearing pitchDisabledRadiusScale lifts that restriction at every radius, so
 * the requested tilt holds at any zoom, including the fully zoomed-out start
 * radius, and when the radius is changed later.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    // Allow full pitch at any radius. This must be set before the pitch write,
    // because the library applies limit changes on the next pitch/yaw/radius write.
    camera.limits.pitchDisabledRadiusScale = null;

    // Write pitch only. Yaw, radius and centre are not touched.
    camera.pitch = pitch;
}
