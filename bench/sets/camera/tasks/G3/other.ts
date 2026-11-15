import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place { yaw: number; pitch: number; radius: number; center: { x: number; y: number; z: number } }

// Arrival means the camera's eye ended where the place's pose puts it.
export function flyToPlace(camera: GeospatialCamera, scene: SceneContext, place: Place, durationMs: number): Promise<boolean> {
    return flyGeospatialCameraToAsync(camera, scene, { ...place, durationMs }).then(
        () => {
            const d = Math.hypot(camera.center.x - place.center.x, camera.center.y - place.center.y, camera.center.z - place.center.z);
            const ang = Math.atan2(Math.sin(camera.yaw - place.yaw), Math.cos(camera.yaw - place.yaw));
            return d < 1e-3 && Math.abs(ang) < 1e-4 && Math.abs(camera.pitch - place.pitch) < 1e-4 && Math.abs(camera.radius - place.radius) < 1e-3;
        },
        () => false,
    );
}
