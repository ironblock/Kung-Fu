```ts
import type { FreeCamera } from "@babylonjs/lite";
import { createBankedFreeCamera } from "@babylonjs/lite";

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
            const dx = target.x - eye.x;
            const dy = target.y - eye.y;
            const dz = target.z - eye.z;
            const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (len < 1e-8) return;

            const fx = dx / len;
            const fy = dy / len;
            const fz = dz / len;

            const dot = up.x * fx + up.y * fy + up.z * fz;

            // Up is (anti-)parallel to the line of sight: keep previous roll.
            if (Math.abs(dot) > 1 - 1e-6) return;

            // Project up onto the plane perpendicular to forward.
            const px = up.x - dot * fx;
            const py = up.y - dot * fy;
            const pz = up.z - dot * fz;

            const pLen = Math.sqrt(px * px + py * py + pz * pz);
            if (pLen < 1e-8) return;

            camera.upVector.x = px / pLen;
            camera.upVector.y = py / pLen;
            camera.upVector.z = pz / pLen;
        },
    };
}
