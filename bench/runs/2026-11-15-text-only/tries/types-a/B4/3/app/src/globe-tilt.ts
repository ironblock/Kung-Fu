import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

/**
 * Tilt a geospatial globe camera to `pitch` radians, measured from looking
 * straight down at the ground (0) toward the horizon.
 *
 * Yaw, radius and centre are left untouched. The camera keeps this tilt at any
 * zoom: the zoom-dependent pitch restriction (`pitchDisabledRadiusScale`) is
 * turned off, because it would otherwise force pitch to `pitchMin` once the
 * camera zooms out (a new camera starts fully zoomed out).
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch)) {
        throw new RangeError(`tiltGlobeCamera: pitch must be finite, got ${pitch}`);
    }

    const limits = camera.limits;

    // Full pitch at every radius. Without this, the effective pitch max falls
    // toward pitchMin as the camera zooms out, and the requested tilt is lost.
    limits.pitchDisabledRadiusScale = null;

    // Make sure the requested tilt lies inside the configured pitch range.
    if (limits.pitchMax < pitch) limits.pitchMax = pitch;
    if (limits.pitchMin > pitch) limits.pitchMin = pitch;

    // Limits are applied on orientation change, so write the pitch through the
    // orientation API. Only pitch is supplied, so yaw, radius and centre keep
    // their current values.
    setGeospatialOrientation(camera, { pitch });

    // Fail loudly if the library clamped the tilt to something else, rather
    // than leaving the camera at an unexpected angle.
    if (Math.abs(camera.pitch - pitch) > 1e-9) {
        throw new Error(
            `tiltGlobeCamera: requested pitch ${pitch} but camera reports ${camera.pitch}`,
        );
    }
}
