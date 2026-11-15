import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilt a geospatial camera to `pitch` radians, measured from looking straight
 * down at the globe (0) toward the horizon. Zoom (radius), heading (yaw) and the
 * centre point are left as they are.
 *
 * The library's default limits cap pitch by zoom: `getEffectivePitchMax` falls
 * from pitchMax to pitchMin as the radius grows from 2R to 4R, and a new camera
 * rests at 4R, so a plain `camera.pitch = p` is clamped to almost zero there.
 * Setting `pitchDisabledRadiusScale` to null gives full pitch at every radius, so
 * the tilt also survives later zoom changes. This lifts the zoom-out pitch rule
 * for this camera.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    camera.limits.pitchDisabledRadiusScale = null;
    // Goes through _setOrientation directly, so it is applied even when the
    // stored pitch already equals the requested value (for example after a clamp).
    setGeospatialOrientation(camera, { pitch });
}
