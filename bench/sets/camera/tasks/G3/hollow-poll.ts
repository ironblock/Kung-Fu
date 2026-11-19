import { flyGeospatialCameraToAsync, normalizeRadians } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place { yaw: number; pitch: number; radius: number; center: { x: number; y: number; z: number } }

// Watch the camera each frame. As soon as it is at the place, we have arrived. If the library's
// flight ends (lands or is cut short) and we never saw it there, we did not.
export function flyToPlace(camera: GeospatialCamera, scene: SceneContext, place: Place, durationMs: number): Promise<boolean> {
    return new Promise((resolve) => {
        let done = false;
        const there = () => {
            const c = camera.center;
            return Math.abs(normalizeRadians(camera.yaw - place.yaw)) < 1e-3 && Math.abs(camera.pitch - place.pitch) < 1e-3 &&
                Math.abs(camera.radius - place.radius) < 1e-3 * place.radius &&
                Math.hypot(c.x - place.center.x, c.y - place.center.y, c.z - place.center.z) < 1e-3 * place.radius;
        };
        const watch = () => {
            if (!done && there()) end(true);
        };
        const end = (v: boolean) => {
            if (done) return;
            done = true;
            const i = scene._beforeRender.indexOf(watch);
            if (i >= 0) scene._beforeRender.splice(i, 1);
            resolve(v);
        };
        flyGeospatialCameraToAsync(camera, scene, { ...place, center: { ...place.center }, durationMs }).then(() => end(there()));
        scene._beforeRender.push(watch);
    });
}
