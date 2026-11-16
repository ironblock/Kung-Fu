import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

const EPSILON = 1e-6;

/**
 * Sets the geospatial camera's pitch to `pitch` (radians, 0 = straight down,
 * larger = toward the horizon) without changing yaw, radius or center.
 *
 * The pitch limits are widened so the requested pitch is allowed at every zoom
 * level, including the fully zoomed-out radius a new camera starts at. The
 * radius-dependent pitch restriction (pitchDisabledRadiusScale) is removed for
 * the same reason. The widened limits stay on the camera, so later zoom changes
 * do not clamp the tilt.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch)) {
        throw new RangeError(`tiltGlobeCamera: pitch must be finite, got ${pitch}`);
    }

    const yaw = camera.yaw;
    const radius = camera.radius;
    const center = { x: camera.center.x, y: camera.center.y, z: camera.center.z };

    // Widen the limits so the requested pitch is inside them at every radius.
    // A new object is assigned so limits shared with other cameras are not mutated.
    const limits = camera.limits;
    camera.limits = {
        ...limits,
        pitchMin: Math.min(limits.pitchMin, pitch),
        pitchMax: Math.max(limits.pitchMax, pitch),
        pitchDisabledRadiusScale: null,
    };

    setGeospatialOrientation(camera, { yaw, pitch, radius, center: { ...center } });

    if (Math.abs(camera.pitch - pitch) > EPSILON) {
        throw new Error(
            `tiltGlobeCamera: pitch is ${camera.pitch}, expected ${pitch}; the library clamped it`,
        );
    }
    if (
        Math.abs(camera.yaw - yaw) > EPSILON ||
        Math.abs(camera.radius - radius) > EPSILON ||
        Math.abs(camera.center.x - center.x) > EPSILON ||
        Math.abs(camera.center.y - center.y) > EPSILON ||
        Math.abs(camera.center.z - center.z) > EPSILON
    ) {
        throw new Error("tiltGlobeCamera: yaw, radius or center changed while setting pitch");
    }
}
