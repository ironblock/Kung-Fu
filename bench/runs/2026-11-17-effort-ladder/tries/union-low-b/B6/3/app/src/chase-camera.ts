import type { FreeCamera } from "@babylonjs/lite";
import { createBankedFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const cam = createBankedFreeCamera(eye, target);

    function bank(up: Vec): void {
        const pos = cam.position;
        const tgt = cam.target;

        const fx = tgt.x - pos.x;
        const fy = tgt.y - pos.y;
        const fz = tgt.z - pos.z;
        const fLen = Math.sqrt(fx * fx + fy * fy + fz * fz);

        if (fLen < 1e-8) return;

        const fnx = fx / fLen;
        const fny = fy / fLen;
        const fnz = fz / fLen;

        const dot = up.x * fnx + up.y * fny + up.z * fnz;
        const px = up.x - dot * fnx;
        const py = up.y - dot * fny;
        const pz = up.z - dot * fnz;

        const pLen = Math.sqrt(px * px + py * py + pz * pz);

        if (pLen < 1e-6) return;

        const banked = cam as unknown as { upVector: { x: number; y: number; z: number } };
        banked.upVector.x = px / pLen;
        banked.upVector.y = py / pLen;
        banked.upVector.z = pz / pLen;
    }

    return { camera: cam, bank };
}
