import type { GeospatialCamera } from "@babylonjs/lite";

const TOLERANCE = 1e-6;

/**
 * Tilts a geospatial camera to `pitch` radians (0 = straight down at the ground,
 * larger = toward the horizon) while keeping its zoom (radius), heading (yaw) and
 * centre unchanged.
 *
 * The library clamps pitch against the radius it is applied with, and by default
 * forces pitch to ~0.001 at large radii (a new camera starts at 4R). To make the
 * tilt hold at every zoom, the radius-dependent falloff is disabled and pitchMax is
 * raised to at least `pitch`. These limit changes are applied on every call and
 * persist on `camera.limits`, so later zoom changes keep the tilt.
 *
 * Throws if the camera still does not reach `pitch` after the limits are changed.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch)) {
        throw new RangeError(`pitch must be a finite number, got ${pitch}`);
    }

    const limits = camera.limits;
    const radius = camera.radius;
    const yaw = camera.yaw;
    const center = { x: camera.center.x, y: camera.center.y, z: camera.center.z };

    // Remove the radius-dependent pitch falloff and make sure pitchMax allows the request.
    limits.pitchDisabledRadiusScale = null;
    if (limits.pitchMax < pitch) {
        limits.pitchMax = pitch;
    }

    // Write the current radius first so the clamp uses the zoom the camera keeps.
    camera.radius = radius;
    camera.pitch = pitch;

    if (Math.abs(camera.pitch - pitch) > TOLERANCE) {
        throw new Error(
            `tiltGlobeCamera: pitch ${pitch} was clamped to ${camera.pitch} ` +
                `(pitchMin ${limits.pitchMin}, pitchMax ${limits.pitchMax})`,
        );
    }
    if (camera.radius !== radius || camera.yaw !== yaw) {
        throw new Error("tiltGlobeCamera: zoom or heading changed while tilting");
    }
    if (camera.center.x !== center.x || camera.center.y !== center.y || camera.center.z !== center.z) {
        throw new Error("tiltGlobeCamera: centre changed while tilting");
    }
}
