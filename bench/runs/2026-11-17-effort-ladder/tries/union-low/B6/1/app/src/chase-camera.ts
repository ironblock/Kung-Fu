import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: 0, y: 1, z: 0 },
    );

    // Unit view direction (eye → target)
    const dx = target.x - eye.x;
    const dy = target.y - eye.y;
    const dz = target.z - eye.z;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const d = { x: dx / len, y: dy / len, z: dz / len };

    function bank(up: Vec): void {
        // Project the car's up onto the plane perpendicular to the view direction.
        // The result is the best possible camera-up that keeps the camera aimed at
        // the target while matching the car's roll as closely as geometry allows.
        const dot = up.x * d.x + up.y * d.y + up.z * d.z;
        const px = up.x - dot * d.x;
        const py = up.y - dot * d.y;
        const pz = up.z - dot * d.z;
        const pLen = Math.sqrt(px * px + py * py + pz * pz);

        // If the car's up is (nearly) parallel to the line of sight the projection
        // vanishes and no unique roll exists; keep the previous orientation.
        if (pLen < 1e-6) return;

        camera.upVector.x = px / pLen;
        camera.upVector.y = py / pLen;
        camera.upVector.z = pz / pLen;
    }

    return { camera, bank };
}
