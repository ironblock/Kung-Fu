import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Sets the camera's pitch (radians, 0 = looking straight down) without
 * changing its yaw, radius (zoom) or centre.
 *
 * The pitch limits are widened and the zoom-dependent pitch cap is disabled,
 * so the requested tilt is not clamped at the current zoom or at zooms the
 * app moves to later.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch)) {
        throw new RangeError("pitch must be a finite number");
    }

    const limits = camera.limits;
    limits.pitchDisabledRadiusScale = null;
    limits.pitchMin = Math.min(limits.pitchMin, pitch);
    limits.pitchMax = Math.max(limits.pitchMax, pitch);

    const yaw = camera.yaw;
    const radius = camera.radius;
    const center = { x: camera.center.x, y: camera.center.y, z: camera.center.z };

    camera._setOrientation(yaw, pitch, radius, center);
}
