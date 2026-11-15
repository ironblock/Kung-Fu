import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

const EPSILON = 1e-4;

type Vec3 = GeospatialCamera["center"];

/**
 * Tilts a geospatial globe camera so it looks at its centre point at `pitch`
 * radians, where 0 is straight down at the ground and pi/2 is the horizon.
 *
 * Only pitch is changed. Yaw (heading), radius (zoom) and centre are kept.
 * The pitch limits are widened so that the requested tilt is not clamped,
 * and the radius-dependent pitch cap is disabled so the tilt survives later
 * zooming in and out.
 *
 * Throws if the camera does not end up with the requested tilt, or if yaw,
 * radius or centre were altered by the library.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch) || pitch < 0 || pitch > Math.PI / 2) {
        throw new RangeError(`pitch must be in [0, PI/2] radians, got ${pitch}`);
    }

    const limits = camera.limits;
    limits.pitchMin = Math.min(limits.pitchMin, pitch);
    limits.pitchMax = Math.max(limits.pitchMax, pitch);
    limits.pitchDisabledRadiusScale = null;

    const yaw = camera.yaw;
    const radius = camera.radius;
    const center: Vec3 = { x: camera.center.x, y: camera.center.y, z: camera.center.z };

    setGeospatialOrientation(camera, { yaw, pitch, radius, center });

    // Verify the result against the library's own state.
    if (Math.abs(camera.yaw - yaw) > EPSILON) {
        throw new Error("tiltGlobeCamera: heading changed");
    }
    if (Math.abs(camera.radius - radius) > EPSILON * Math.max(1, radius)) {
        throw new Error("tiltGlobeCamera: zoom (radius) changed");
    }
    const c = camera.center;
    if (
        Math.abs(c.x - center.x) > EPSILON * Math.max(1, radius) ||
        Math.abs(c.y - center.y) > EPSILON * Math.max(1, radius) ||
        Math.abs(c.z - center.z) > EPSILON * Math.max(1, radius)
    ) {
        throw new Error("tiltGlobeCamera: centre changed");
    }

    const actual = measureTilt(camera);
    if (Math.abs(actual - pitch) > 1e-3) {
        throw new Error(
            `tiltGlobeCamera: camera looks at ${actual.toFixed(4)} rad, expected ${pitch.toFixed(4)} rad. ` +
                `Check the library's pitch convention.`
        );
    }
}

/**
 * Angle in radians between the view direction (position -> centre) and the
 * straight-down direction at the centre, i.e. the tilt measured from the
 * ground normal. 0 is straight down, pi/2 is the horizon.
 *
 * Assumes the planet is centred at the origin, so the ground normal at the
 * centre point is the normalised centre vector.
 */
function measureTilt(camera: GeospatialCamera): number {
    const p = camera.position;
    const c = camera.center;

    const vx = c.x - p.x;
    const vy = c.y - p.y;
    const vz = c.z - p.z;
    const vLen = Math.hypot(vx, vy, vz);

    const nLen = Math.hypot(c.x, c.y, c.z);
    if (vLen === 0 || nLen === 0) {
        throw new Error("tiltGlobeCamera: degenerate camera or centre");
    }

    // Straight-down direction at the centre is -normal.
    const dot = (vx * -c.x + vy * -c.y + vz * -c.z) / (vLen * nLen);
    return Math.acos(Math.min(1, Math.max(-1, dot)));
}
