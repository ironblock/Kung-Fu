import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

export function flyToPlace(
    camera: GeospatialCamera,
    scene: SceneContext,
    place: Place,
    durationMs: number
): Promise<boolean> {
    let arrived = true;

    const promise = flyGeospatialCameraToAsync(camera, scene, {
        yaw: place.yaw,
        pitch: place.pitch,
        radius: place.radius,
        center: place.center,
        durationMs,
    });

    const cancelFly = camera._cancelFly;
    if (cancelFly) {
        camera._cancelFly = () => {
            arrived = false;
            cancelFly();
        };
    }

    return promise.then(() => arrived);
}
