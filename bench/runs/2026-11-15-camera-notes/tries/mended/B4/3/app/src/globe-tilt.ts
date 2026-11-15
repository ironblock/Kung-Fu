import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilts a geospatial globe camera to `pitch` radians, measured from looking
 * straight down (0) toward the horizon. Yaw, radius and centre are kept as they are.
 *
 * By default the library forces pitch down to about 0.001 at large radii
 * (a new camera starts at radius 4 * planetRadius), so the pitch limit that
 * depends on radius is switched off here. Without that, the tilt would be lost.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch)) {
        throw new RangeError(`pitch must be a finite number, got ${pitch}`);
    }

    // Stop the radius-dependent pitch cap from overriding the requested tilt,
    // at this zoom and at any later zoom.
    camera.limits.pitchDisabledRadiusScale = null;

    // Write yaw, pitch, radius and centre in one call. A copy of the centre is
    // passed so the camera does not share the caller's object.
    const { yaw, radius, center } = camera;
    setGeospatialOrientation(camera, {
        yaw,
        pitch,
        radius,
        center: { x: center.x, y: center.y, z: center.z },
    });

    // The library may still clamp pitch (e.g. to pitchMin/pitchMax).
    // Fail loudly rather than leave the view at a different tilt than requested.
    if (Math.abs(camera.pitch - pitch) > 1e-6) {
        throw new Error(
            `globe camera pitch is ${camera.pitch}, requested ${pitch} (limits: pitchMin ${camera.limits.pitchMin}, pitchMax ${camera.limits.pitchMax})`,
        );
    }
}
