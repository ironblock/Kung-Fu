import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const camera = createBankedFreeCamera(eye, target, { x: 0, y: 1, z: 0 });
    return {
        camera,
        bank(up: Vec): void {
            const p = camera.position, t = camera.target;
            let dx = t.x - p.x, dy = t.y - p.y, dz = t.z - p.z;
            const l = Math.hypot(dx, dy, dz);
            dx /= l; dy /= l; dz /= l;
            const dot = up.x * dx + up.y * dy + up.z * dz;
            const cx = up.y * dz - up.z * dy, cy = up.z * dx - up.x * dz, cz = up.x * dy - up.y * dx;
            // An up within about 8 degrees of the line of sight gives an unstable roll: keep the last one.
            if (Math.abs(dot) > 0.99) return;
            camera.upVector.set(up.x, up.y, up.z);
        },
    };
}
