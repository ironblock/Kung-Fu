import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilts a geospatial globe camera to `pitch` radians, where 0 looks straight
 * down at the ground and larger values tilt toward the horizon.
 *
 * Radius, yaw and center are left as they are. The radius-based pitch
 * restriction (pitchDisabledRadiusScale) is removed, because with the default
 * limits pitch is forced to pitchMin at radius >= 4 * planetRadius, which is
 * where a new camera starts. Without this change the tilt would be lost
 * immediately, and it would also be lost whenever the app zooms out.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    camera.limits.pitchDisabledRadiusScale = null;

    // An in-progress flight would overwrite the pitch on its next frame.
    camera._cancelFly?.();

    camera.pitch = pitch;
}
