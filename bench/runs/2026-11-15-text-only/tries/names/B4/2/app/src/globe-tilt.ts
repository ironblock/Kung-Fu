import type { GeospatialCamera } from "@babylonjs/lite";
import { getEffectivePitchMax, setGeospatialOrientation } from "@babylonjs/lite";

const EPS = 1e-6;

function angleDiff(a: number, b: number): number {
    const d = a - b;
    return Math.abs(Math.atan2(Math.sin(d), Math.cos(d)));
}

/**
 * Tilts a geospatial globe camera to `pitch` radians (0 = looking straight down,
 * larger = toward the horizon) while keeping its zoom (radius), heading (yaw)
 * and centre point unchanged.
 *
 * The pitch limit of the camera depends on the zoom level through
 * `limits.pitchDisabledRadiusScale`, so a pitch that is valid when zoomed in can
 * be clamped away when the camera is fully zoomed out. To make the tilt stick at
 * every zoom level, the radius-dependent restriction is removed and the pitch
 * ceiling is raised to at least `pitch`.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch) || pitch < 0) {
        throw new RangeError(`tiltGlobeCamera: pitch must be a finite, non-negative number (got ${pitch})`);
    }

    const limits = camera.limits;
    limits.pitchDisabledRadiusScale = null;
    limits.pitchMax = Math.max(limits.pitchMax, pitch);
    limits.pitchMin = Math.min(limits.pitchMin, pitch);

    // Capture the view state that must be preserved.
    const yaw = camera.yaw;
    const radius = camera.radius;
    const center = camera.center;
    const cx = center.x;
    const cy = center.y;
    const cz = center.z;

    setGeospatialOrientation(camera, { yaw, pitch, radius, center });

    // Verify the tilt was applied and that the rest of the view state is intact.
    for (const r of [radius, limits.radiusMin, limits.radiusMax]) {
        if (getEffectivePitchMax(limits, r) + EPS < pitch) {
            throw new Error(`tiltGlobeCamera: pitch ${pitch} is still limited at radius ${r}`);
        }
    }
    if (angleDiff(camera.pitch, pitch) > EPS) {
        throw new Error(`tiltGlobeCamera: camera pitch is ${camera.pitch}, expected ${pitch}`);
    }
    if (angleDiff(camera.yaw, yaw) > EPS) {
        throw new Error(`tiltGlobeCamera: camera yaw changed from ${yaw} to ${camera.yaw}`);
    }
    if (Math.abs(camera.radius - radius) > EPS * Math.max(1, radius)) {
        throw new Error(`tiltGlobeCamera: camera radius changed from ${radius} to ${camera.radius}`);
    }
    const c = camera.center;
    if (Math.abs(c.x - cx) > EPS || Math.abs(c.y - cy) > EPS || Math.abs(c.z - cz) > EPS) {
        throw new Error("tiltGlobeCamera: camera centre changed");
    }
}
