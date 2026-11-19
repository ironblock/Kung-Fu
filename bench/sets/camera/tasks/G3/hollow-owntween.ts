import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place { yaw: number; pitch: number; radius: number; center: { x: number; y: number; z: number } }

// Our own tween on the render loop, so we know whether it ran to the end. It registers in the camera's
// fly slot, so a library fly-to (or the controls) cuts it short the same way they cut the library's own.
export function flyToPlace(camera: GeospatialCamera, scene: SceneContext, place: Place, durationMs: number): Promise<boolean> {
    camera._cancelFly?.();
    const y0 = camera.yaw, p0 = camera.pitch, r0 = camera.radius, c0 = { ...camera.center };
    let dy = place.yaw - y0; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    return new Promise((resolve) => {
        let t = 0;
        const stop = (v: boolean) => {
            const i = scene._beforeRender.indexOf(step);
            if (i >= 0) scene._beforeRender.splice(i, 1);
            if (camera._cancelFly === cancel) camera._cancelFly = undefined;
            resolve(v);
        };
        const cancel = () => stop(false);
        const step = (dt: number) => {
            t += dt;
            const g = Math.min(1, t / Math.max(1, durationMs));
            const e = g * g * (3 - 2 * g);
            setGeospatialOrientation(camera, {
                yaw: y0 + dy * e, pitch: p0 + (place.pitch - p0) * e, radius: r0 + (place.radius - r0) * e,
                center: { x: c0.x + (place.center.x - c0.x) * e, y: c0.y + (place.center.y - c0.y) * e, z: c0.z + (place.center.z - c0.z) * e },
            });
            if (g >= 1) stop(true);
        };
        camera._cancelFly = cancel;
        scene._beforeRender.push(step);
    });
}
