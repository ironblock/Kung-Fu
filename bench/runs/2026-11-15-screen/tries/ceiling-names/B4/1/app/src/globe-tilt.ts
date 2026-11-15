import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilts the globe camera to `pitch` radians, where 0 looks straight down at
 * the ground and larger values tilt toward the horizon. The zoom (radius),
 * heading (yaw) and centre point stay as they are.
 *
 * The camera's limits normally shrink the allowed pitch as the camera zooms
 * out (`limits.pitchDisabledRadiusScale`, used by `getEffectivePitchMax`).
 * When fully zoomed out, which is where a new camera starts, the allowed
 * pitch is down to `pitchMin`, so any tilt would be clamped back to almost
 * straight down. This function turns that off so the tilt applies at every
 * zoom level and stays when the camera is later moved nearer or farther.
 *
 * Note: this changes `camera.limits`.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch)) {
        throw new RangeError(`tiltGlobeCamera: pitch must be a finite number, got ${pitch}`);
    }

    const limits = camera.limits;

    // Let the full pitch range apply at every radius, not just near the ground.
    limits.pitchDisabledRadiusScale = null;

    // Widen the fixed pitch limits only if the requested tilt is outside them.
    if (limits.pitchMin > pitch) limits.pitchMin = pitch;
    if (limits.pitchMax < pitch) limits.pitchMax = pitch;

    // Set the pitch only, so yaw, radius and center stay unchanged, and the
    // camera's position and look-at are recomputed from the new orientation.
    setGeospatialOrientation(camera, { pitch });
}
