import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

/**
 * Tilts a geospatial globe camera to `pitch` radians, measured from looking
 * straight down (0) toward the horizon (pi/2), while keeping its zoom (radius),
 * heading (yaw) and centre point unchanged. The tilt is kept at every zoom level.
 *
 * The library's default `pitchDisabledRadiusScale` forces pitch down to
 * `pitchMin` as the camera zooms out (a fully zoomed-out camera looks straight
 * down). That would both block the tilt on a fresh camera and undo it when the
 * app zooms, so it is disabled here. `pitchMax` is raised if needed so it can
 * hold the requested pitch.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch)) {
        throw new RangeError(`tiltGlobeCamera: pitch must be a finite number, got ${pitch}`);
    }

    const limits = camera.limits;
    // Remove the radius-based pitch cap so the tilt is not forced down when zoomed out.
    limits.pitchDisabledRadiusScale = null;
    // Make sure the pitch ceiling allows the requested tilt.
    if (limits.pitchMax < pitch) {
        limits.pitchMax = pitch;
    }

    // Apply only the pitch. Yaw, radius and centre are omitted, so they keep their values.
    setGeospatialOrientation(camera, { pitch });
}
