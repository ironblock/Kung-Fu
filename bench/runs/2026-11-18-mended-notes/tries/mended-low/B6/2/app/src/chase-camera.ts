import type { FreeCamera } from "@babylonjs/lite";
import { createBankedFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const camera = createBankedFreeCamera(eye, target, { x: 0, y: 1, z: 0 });

    // Fixed view direction (eye and target never change after creation)
    const dx = target.x - eye.x;
    const dy = target.y - eye.y;
    const dz = target.z - eye.z;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const fx = dx / len;
    const fy = dy / len;
    const fz = dz / len;

    function bank(up: Vec): void {
        // Project the requested up onto the plane perpendicular to the view
        // direction; that is the closest valid camera-up we can achieve.
        const dot = up.x * fx + up.y * fy + up.z * fz;
        const px = up.x - dot * fx;
        const py = up.y - dot * fy;
        const pz = up.z - dot * fz;

        const pLen = Math.sqrt(px * px + py * py + pz * pz);

        if (pLen < 1e-6) {
            // up is (anti-)parallel to the line of sight: no valid roll,
            // keep the previous one.
            return;
        }

        const inv = 1 / pLen;
        camera.upVector.x = px * inv;
        camera.upVector.y = py * inv;
        camera.upVector.z = pz * inv;
    }

    return { camera, bank };
}
