import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place { yaw: number; pitch: number; radius: number; center: { x: number; y: number; z: number } }

// Hollow: no flight. It puts the camera at the place at once, then waits out the duration on the
// render loop and says true unless another flight was started. Nothing flies smoothly.
export function flyToPlace(camera: GeospatialCamera, scene: SceneContext, place: Place, durationMs: number): Promise<boolean> {
    setGeospatialOrientation(camera, { ...place, center: { ...place.center } });
    const c = camera as unknown as { _cancelFly?: () => void };
    c._cancelFly?.();
    return new Promise((resolve) => {
        let t = 0;
        let cut = false;
        c._cancelFly = () => { cut = true; };
        const step = (dt: number) => {
            t += dt;
            if (cut || t >= durationMs) {
                const at = scene._beforeRender.indexOf(step);
                if (at >= 0) scene._beforeRender.splice(at, 1);
                if (c._cancelFly && !cut) c._cancelFly = undefined;
                resolve(!cut);
            }
        };
        scene._beforeRender.push(step);
    });
}
