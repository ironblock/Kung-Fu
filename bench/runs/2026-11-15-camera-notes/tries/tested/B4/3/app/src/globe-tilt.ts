import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

const ANGLE_EPSILON = 1e-6;

function sameAngle(a: number, b: number): boolean {
    return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b))) < ANGLE_EPSILON;
}

/**
 * Tilts a geospatial camera to `pitch` radians from straight down (0) toward the horizon,
 * keeping its zoom (radius), heading (yaw) and centre point unchanged.
 *
 * The default limits force pitch to ~0 once the radius reaches 4 * planetRadius (the zoom a
 * new camera starts at), so the radius-dependent pitch ceiling is removed here. Without that,
 * the requested tilt would be silently clamped and would not hold when zooming.
 *
 * Throws if the camera does not end up at the requested pitch, so a clamp that is still
 * in effect cannot pass unnoticed.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch) || pitch < 0) {
        throw new RangeError(`tiltGlobeCamera: pitch must be a non-negative finite number, got ${pitch}`);
    }

    const limits = camera.limits;
    // The radius-dependent pitch ceiling is what caps the tilt at the default zoom.
    limits.pitchDisabledRadiusScale = null;
    // Make sure the requested pitch is inside the fixed pitch range.
    if (limits.pitchMax < pitch) {
        limits.pitchMax = pitch;
    }
    if (limits.pitchMin > pitch) {
        limits.pitchMin = pitch;
    }

    // A running flight would overwrite the pitch on its next frame.
    camera._cancelFly?.();

    // Keep the current zoom, heading and centre; only pitch changes. Passing the radius and pitch
    // together lets the clamp use the new radius rather than the old one.
    const yaw = camera.yaw;
    const radius = camera.radius;
    const center = camera.center;
    const centerCopy = { x: center.x, y: center.y, z: center.z };
    setGeospatialOrientation(camera, { yaw, pitch, radius, center: centerCopy });

    const centerMoved =
        Math.abs(camera.center.x - centerCopy.x) +
            Math.abs(camera.center.y - centerCopy.y) +
            Math.abs(camera.center.z - centerCopy.z) >
        1e-6 * Math.max(1, Math.abs(radius));
    if (
        Math.abs(camera.pitch - pitch) > ANGLE_EPSILON ||
        Math.abs(camera.radius - radius) > 1e-6 * Math.max(1, Math.abs(radius)) ||
        !sameAngle(camera.yaw, yaw) ||
        centerMoved
    ) {
        throw new Error(
            `tiltGlobeCamera: camera did not take pitch ${pitch} (got ${camera.pitch}); ` +
                "zoom, heading or centre changed or the pitch was clamped",
        );
    }
}
