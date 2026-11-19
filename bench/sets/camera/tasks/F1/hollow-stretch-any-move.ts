import { attachFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// Keep the library's controls exactly as they are, and after each of their frames stretch the step they
// moved the camera by 20. Turning is left alone, since it does not move the camera.
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const detach = attachFreeControl(camera, canvas, scene);
    let px = camera.position.x, py = camera.position.y, pz = camera.position.z;
    const stretch = (): void => {
        const dx = camera.position.x - px, dy = camera.position.y - py, dz = camera.position.z - pz;
        if (dx !== 0 || dy !== 0 || dz !== 0) {
            camera.position.x += 19 * dx;
            camera.position.y += 19 * dy;
            camera.position.z += 19 * dz;
            camera.target.set(camera.target.x + 19 * dx, camera.target.y + 19 * dy, camera.target.z + 19 * dz);
        }
        px = camera.position.x; py = camera.position.y; pz = camera.position.z;
    };
    scene._beforeRender.push(stretch);
    return () => {
        detach();
        const at = scene._beforeRender.indexOf(stretch);
        if (at >= 0) scene._beforeRender.splice(at, 1);
    };
}
