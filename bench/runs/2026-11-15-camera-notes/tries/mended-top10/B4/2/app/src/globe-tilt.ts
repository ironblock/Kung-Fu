import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

/**
 * Tilts a geospatial camera to `pitch` radians, measured from looking straight
 * down at the ground (0) toward the horizon. Zoom (radius), heading (yaw) and
 * the centre point are kept as they are.
 *
 * The library caps pitch by radius: zoomed far out (around 2R to 4R and beyond)
 * the cap falls to about 0.001, so a far camera cannot tilt. To keep the tilt
 * at every zoom, this disables that radius-based cap on the camera's limits and
 * raises pitchMax / lowers pitchMin if the requested pitch lies outside them.
 * Later zoom changes then leave the pitch alone.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    const limits = camera.limits;
    limits.pitchDisabledRadiusScale = null;
    if (pitch > limits.pitchMax) limits.pitchMax = pitch;
    if (pitch < limits.pitchMin) limits.pitchMin = pitch;

    // A running fly animation would overwrite the orientation we set here.
    camera._cancelFly?.();

    // Copy the centre so the library cannot alias or mutate our caller's object.
    const c = camera.center;
    setGeospatialOrientation(camera, {
        yaw: camera.yaw,
        pitch,
        radius: camera.radius,
        center: { x: c.x, y: c.y, z: c.z },
    });
}
