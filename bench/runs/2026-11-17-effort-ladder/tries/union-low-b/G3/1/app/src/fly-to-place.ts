import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

function angleDelta(a: number, b: number): number {
    let d = a - b;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    return Math.abs(d);
}

export function flyToPlace(
    camera: GeospatialCamera,
    scene: SceneContext,
    place: Place,
    durationMs: number
): Promise<boolean> {
    return flyGeospatialCameraToAsync(camera, scene, {
        yaw: place.yaw,
        pitch: place.pitch,
        radius: place.radius,
        center: place.center,
        durationMs,
    }).then(() => {
        const angleEps = 1e-4;
        const distEps = 1e-3;
        return (
            angleDelta(camera.yaw, place.yaw) < angleEps &&
            Math.abs(camera.pitch - place.pitch) < angleEps &&
            Math.abs(camera.radius - place.radius) < distEps &&
            Math.abs(camera.center.x - place.center.x) < distEps &&
            Math.abs(camera.center.y - place.center.y) < distEps &&
            Math.abs(camera.center.z - place.center.z) < distEps
        );
    });
}
