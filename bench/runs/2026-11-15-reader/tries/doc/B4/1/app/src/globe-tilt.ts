import { setGeospatialOrientation, type GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilt a geospatial globe camera to `pitch` (radians; 0 = looking straight down
 * at the ground, larger = toward the horizon) while keeping its zoom (radius),
 * heading (yaw) and centre point unchanged.
 *
 * The library's pitch limits are radius-dependent: `getEffectivePitchMax` pulls
 * the maximum pitch down to `pitchMin` as the camera zooms out, and a fresh
 * camera rests at `radiusMax`, where that maximum is `pitchMin` (~0.001). A plain
 * `camera.pitch = pitch` would therefore be clamped to nearly straight down.
 *
 * Raising `limits.pitchMin` to the requested tilt makes that tilt the floor of
 * the allowed range at every radius. The effective maximum is always at least
 * `pitchMin`, so the tilt survives later `radius` changes (zooming in or out),
 * and the zoom-out auto-pitch behaviour still applies to pitches above the tilt.
 * Side effect: the camera's own controls can no longer pitch below this tilt
 * until the function is called again with a smaller value.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch)) {
        throw new RangeError(`tiltGlobeCamera: pitch must be a finite number, got ${pitch}`);
    }
    camera.limits.pitchMin = pitch;
    // Always go through the orientation path (not the `pitch` setter) so the
    // clamp runs even if the stored pitch already equals `pitch`.
    setGeospatialOrientation(camera, { pitch });
}
