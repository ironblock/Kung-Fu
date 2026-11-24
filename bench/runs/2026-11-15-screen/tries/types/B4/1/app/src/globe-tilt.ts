import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

/**
 * Set the tilt of a GeospatialCamera without changing its zoom (radius),
 * heading (yaw) or centre point.
 *
 * `pitch` is in radians: 0 looks straight down at the ground, larger values
 * tilt toward the horizon.
 *
 * The library lowers the allowed pitch as the camera zooms out when
 * `limits.pitchDisabledRadiusScale` is set. A new camera starts fully zoomed
 * out, so a requested tilt would be silently forced down to `pitchMin` there,
 * and any later zoom would also change the tilt. Clearing that setting makes
 * the pitch limit `pitchMax` at every radius, so the tilt holds while zooming.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch)) {
        throw new RangeError(`tiltGlobeCamera: pitch must be a finite number, got ${pitch}`);
    }
    const limits = camera.limits;
    if (pitch < limits.pitchMin || pitch > limits.pitchMax) {
        throw new RangeError(
            `tiltGlobeCamera: pitch ${pitch} is outside the camera limits [${limits.pitchMin}, ${limits.pitchMax}]`,
        );
    }

    // Allow the full pitch range at every zoom level, so the tilt is not
    // reduced when the camera is zoomed out (including its starting zoom).
    limits.pitchDisabledRadiusScale = null;

    // Only pitch is supplied; yaw, radius and center keep their current values.
    setGeospatialOrientation(camera, { pitch });
}
