import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const camera = createBankedFreeCamera(eye, target, { x: 0, y: 1, z: 0 });
    return {
        camera,
        bank(up: Vec): void {
            const p = camera.position;
            const t = camera.target;
            const dx = t.x - p.x;
            const dy = t.y - p.y;
            const dz = t.z - p.z;
            const cx = up.y * dz - up.z * dy;
            const cy = up.z * dx - up.x * dz;
            const cz = up.x * dy - up.y * dx;
            // An up vector along the line of sight makes the camera fall back to an identity rotation, which
            // would stop it looking at the target. Keep the previous roll instead.
            if (Math.hypot(cx, cy, cz) <= 1e-6 * Math.hypot(dx, dy, dz)) {
                return;
            }
            camera.upVector.set(up.x, up.y, up.z);
        },
    };
}
