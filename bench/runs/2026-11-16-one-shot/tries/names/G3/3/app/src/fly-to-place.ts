import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place { yaw: number; pitch: number; radius: number; center: { x: number; y: number; z: number } }

// Stop hook of the flyToPlace call currently in progress for each camera, if any.
const activeStops = new WeakMap<GeospatialCamera, () => void>();

const ANGLE_EPSILON = 1e-4; // radians
const REL_EPSILON = 1e-4;

function angleDelta(a: number, b: number): number {
    let d = (a - b) % (2 * Math.PI);
    if (d > Math.PI) d -= 2 * Math.PI;
    if (d < -Math.PI) d += 2 * Math.PI;
    return Math.abs(d);
}

function near(a: number, b: number): boolean {
    return Math.abs(a - b) <= REL_EPSILON * Math.max(1, Math.abs(a), Math.abs(b));
}

function isAt(camera: GeospatialCamera, place: Place): boolean {
    const c = camera.center;
    return angleDelta(camera.yaw, place.yaw) <= ANGLE_EPSILON &&
        angleDelta(camera.pitch, place.pitch) <= ANGLE_EPSILON &&
        near(camera.radius, place.radius) &&
        near(c.x, place.center.x) &&
        near(c.y, place.center.y) &&
        near(c.z, place.center.z);
}

export function flyToPlace(
    camera: GeospatialCamera,
    scene: SceneContext,
    place: Place,
    durationMs: number
): Promise<boolean> {
    // A new fly-to from this function stops the previous one first.
    activeStops.get(camera)?.();

    return new Promise<boolean>((resolve) => {
        let done = false;
        let libraryStop: (() => void) | undefined;

        const finish = (arrived: boolean) => {
            if (done) return;
            done = true;
            if (activeStops.get(camera) === hook) activeStops.delete(camera);
            if (camera._cancelFly === hook) camera._cancelFly = undefined;
            resolve(arrived);
        };

        // Called when another fly-to (from anywhere) stops this one.
        const hook = () => {
            libraryStop?.();
            finish(false);
        };

        const previous = camera._cancelFly;
        let flight: Promise<void>;
        try {
            flight = flyGeospatialCameraToAsync(camera, scene, {
                yaw: place.yaw,
                pitch: place.pitch,
                radius: place.radius,
                center: place.center,
                durationMs,
            });
        } catch {
            resolve(false);
            return;
        }

        // Keep the library's own stop for this flight and chain to it from our hook.
        const installed = camera._cancelFly;
        libraryStop = installed !== previous ? installed : undefined;
        camera._cancelFly = hook;
        activeStops.set(camera, hook);

        const settle = () => finish(isAt(camera, place));
        flight.then(settle, settle);
    });
}
