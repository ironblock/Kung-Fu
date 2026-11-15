import type { GeospatialCamera } from "@babylonjs/lite";

/**
 * Tilts a geospatial globe camera to `pitch` radians (0 = straight down,
 * larger = toward the horizon) without changing yaw, radius or center.
 *
 * The camera clamps pitch against its current radius, which forces a
 * near-zero pitch when zoomed far out. Setting `pitchDisabledRadiusScale`
 * to null removes that radius-dependent limit so the tilt holds at every
 * zoom level, including later zoom changes.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    // Must be set before the orientation write below; limit changes apply
    // at the next yaw/pitch/radius/center write.
    camera.limits.pitchDisabledRadiusScale = null;

    // Keep the current pose. Copy center, since camera.center is a live object.
    const yaw = camera.yaw;
    const radius = camera.radius;
    const center = { x: camera.center.x, y: camera.center.y, z: camera.center.z };

    // Write yaw, radius, center and pitch together so pitch is never clamped
    // against a stale radius.
    camera._setOrientation(yaw, pitch, radius, center);
}
