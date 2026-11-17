import type { FreeCamera, BankedFreeCamera } from "@babylonjs/lite";
import { createBankedFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const cam: BankedFreeCamera = createBankedFreeCamera(eye, target, { x: 0, y: 1, z: 0 });
    const upVec = cam.upVector;

    function bank(up: Vec): void {
        const fx = target.x - eye.x;
        const fy = target.y - eye.y;
        const fz = target.z - eye.z;
        const fLen = Math.sqrt(fx * fx + fy * fy + fz * fz);
        if (fLen < 1e-8) return;

        const invF = 1 / fLen;
        const fwx = fx * invF;
        const fwy = fy * invF;
        const fwz = fz * invF;

        const dot = up.x * fwx + up.y * fwy + up.z * fwz;
        const px = up.x - dot * fwx;
        const py = up.y - dot * fwy;
        const pz = up.z - dot * fwz;

        const pLen = Math.sqrt(px * px + py * py + pz * pz);
        if (pLen < 1e-6) return;

        const invP = 1 / pLen;
        upVec.x = px * invP;
        upVec.y = py * invP;
        upVec.z = pz * invP;
    }

    return { camera: cam, bank };
}
