import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

/**
 * Tilts a geospatial globe camera to `pitch` radians, where 0 looks straight
 * down at the ground and larger values tilt toward the horizon.
 *
 * Yaw (heading), radius (zoom) and center are left untouched. The pitch limit
 * is widened so that the requested tilt is kept at every zoom level, including
 * the fully zoomed-out default that a new camera starts at.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch) || pitch < 0 || pitch > Math.PI / 2) {
        throw new RangeError(`tiltGlobeCamera: pitch must be in [0, PI/2], got ${pitch}`);
    }

    const limits = camera.limits;

    // By default the pitch limit is radius-dependent and forces pitch to ~0.001
    // at large radii, so a tilt written at the default zoom would be lost.
    // Disable that radius-based restriction and make sure the cap admits `pitch`.
    limits.pitchDisabledRadiusScale = null;
    if (limits.pitchMax < pitch) {
        limits.pitchMax = pitch;
    }

    // Pass the current radius explicitly so yaw, radius and center are not changed.
    // Changing limits does not re-clamp on its own, so this pitch write is what applies them.
    setGeospatialOrientation(camera, { pitch, radius: camera.radius });

    if (Math.abs(camera.pitch - pitch) > 1e-9) {
        throw new Error(
            `tiltGlobeCamera: camera pitch is ${camera.pitch}, expected ${pitch}; the pitch limit did not admit it`,
        );
    }
}
