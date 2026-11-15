import type { GeospatialCamera } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

const ANGLE_TOLERANCE = 1e-6;

function anglesEqual(a: number, b: number): boolean {
    // Compare headings modulo 2*PI.
    const d = a - b;
    return Math.abs(Math.atan2(Math.sin(d), Math.cos(d))) < ANGLE_TOLERANCE;
}

function closeTo(a: number, b: number): boolean {
    return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
}

/**
 * Tilts a geospatial camera to `pitch` radians, where 0 looks straight down at
 * the ground and larger values move toward the horizon. Zoom (radius), heading
 * (yaw) and the centre point are kept as they are.
 *
 * Throws if the library clamps the pitch, yaw, radius or centre, so the caller
 * never gets a camera that silently differs from what was requested.
 */
export function tiltGlobeCamera(camera: GeospatialCamera, pitch: number): void {
    if (!Number.isFinite(pitch)) {
        throw new RangeError(`pitch must be a finite number, got ${pitch}`);
    }

    // A running fly-to would keep moving the camera, so stop it first.
    camera._cancelFly?.();

    // By default the library forces pitch down to about 0 once the camera is
    // zoomed out past 4 planet radii, which discards the requested tilt. Turning
    // that rule off means pitch is limited only by limits.pitchMin/pitchMax, so
    // the tilt holds when the camera is zoomed in or out later.
    camera.limits.pitchDisabledRadiusScale = null;

    const radius = camera.radius;
    const yaw = camera.yaw;
    const center = { x: camera.center.x, y: camera.center.y, z: camera.center.z };

    // Setting radius, yaw and pitch in one call clamps pitch against the radius
    // it is written with, so the tilt is not lost.
    setGeospatialOrientation(camera, { yaw, pitch, radius, center });

    if (!closeTo(camera.pitch, pitch)) {
        throw new Error(
            `Requested pitch ${pitch} but the camera is at ${camera.pitch}; check camera.limits.pitchMin/pitchMax`,
        );
    }
    if (!closeTo(camera.radius, radius)) {
        throw new Error(`Zoom changed from ${radius} to ${camera.radius} while tilting`);
    }
    if (!anglesEqual(camera.yaw, yaw)) {
        throw new Error(`Heading changed from ${yaw} to ${camera.yaw} while tilting`);
    }
    if (
        !closeTo(camera.center.x, center.x) ||
        !closeTo(camera.center.y, center.y) ||
        !closeTo(camera.center.z, center.z)
    ) {
        throw new Error("Centre point changed while tilting");
    }
}
