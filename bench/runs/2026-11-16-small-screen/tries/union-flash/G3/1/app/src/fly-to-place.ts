import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync, setGeospatialOrientation } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

interface NormalizedTarget {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

const TWO_PI = Math.PI * 2;
const ARRIVAL_EPSILON = 1e-3;

/*
 * flyGeospatialCameraToAsync resolves for both normal completion and
 * cancellation, and its promise carries no success/failure result.
 *
 * So we decide success by comparing the camera pose after the promise settles.
 * We also keep a per-camera token so that if another flyToPlace call starts
 * before this one settles, the earlier call is treated as stopped/false even
 * if the camera happens to end up at the requested place.
 */
const activeFlights = new WeakMap<GeospatialCamera, number>();
let nextFlightToken = 0;

function normalizeAngle(angle: number): number {
    let wrapped = angle % TWO_PI;

    // Match the library's [-PI, PI) readback convention.
    if (wrapped >= Math.PI) {
        wrapped -= TWO_PI;
    } else if (wrapped < -Math.PI) {
        wrapped += TWO_PI;
    }

    return wrapped;
}

function makeTarget(place: Place): NormalizedTarget | null {
    if (
        !Number.isFinite(place.yaw) ||
        !Number.isFinite(place.pitch) ||
        !Number.isFinite(place.radius) ||
        place.radius <= 0
    ) {
        return null;
    }

    const center = {
        x: place.center.x,
        y: place.center.y,
        z: place.center.z,
    };

    if (
        !Number.isFinite(center.x) ||
        !Number.isFinite(center.y) ||
        !Number.isFinite(center.z)
    ) {
        return null;
    }

    return {
        yaw: normalizeAngle(place.yaw),
        pitch: normalizeAngle(place.pitch),
        radius: place.radius,
        center,
    };
}

function angleClose(a: number, b: number): boolean {
    if (!Number.isFinite(a) || !Number.isFinite(b)) {
        return false;
    }

    return Math.abs(normalizeAngle(a) - normalizeAngle(b)) <= ARRIVAL_EPSILON;
}

function closeTo(camera: GeospatialCamera, target: NormalizedTarget): boolean {
    return (
        angleClose(camera.yaw, target.yaw) &&
        angleClose(camera.pitch, target.pitch) &&
        Number.isFinite(camera.radius) &&
        Math.abs(camera.radius - target.radius) <= ARRIVAL_EPSILON &&
        Math.abs(camera.center.x - target.center.x) <= ARRIVAL_EPSILON &&
        Math.abs(camera.center.y - target.center.y) <= ARRIVAL_EPSILON &&
        Math.abs(camera.center.z - target.center.z) <= ARRIVAL_EPSILON
    );
}

export async function flyToPlace(
    camera: GeospatialCamera,
    scene: SceneContext,
    place: Place,
    durationMs: number,
): Promise<boolean> {
    const target = makeTarget(place);
    if (!target) {
        return false;
    }

    const duration = Number.isFinite(durationMs) ? Math.max(0, durationMs) : 0;
    const token = ++nextFlightToken;

    // Stop any in-progress geospatial fly before starting ours. This covers
    // flights started by flyToPlace as well as direct calls elsewhere.
    try {
        camera._cancelFly?.();
    } catch {
        // Do not let cancellation side effects reject this promise.
    }

    activeFlights.set(camera, token);

    const center = target.center as unknown as GeospatialCamera["center"];

    try {
        if (duration <= 0) {
            // No animation requested: set the pose directly.
            setGeospatialOrientation(camera, {
                yaw: target.yaw,
                pitch: target.pitch,
                radius: target.radius,
                center,
            });
        } else {
            await flyGeospatialCameraToAsync(camera, scene, {
                yaw: target.yaw,
                pitch: target.pitch,
                radius: target.radius,
                center,
                durationMs: duration,
            });
        }
    } catch {
        if (activeFlights.get(camera) === token) {
            activeFlights.delete(camera);
        }
        return false;
    }

    const isCurrentFlight = activeFlights.get(camera) === token;
    const arrived = closeTo(camera, target);

    if (isCurrentFlight && arrived) {
        activeFlights.delete(camera);
    }

    return isCurrentFlight && arrived;
}
