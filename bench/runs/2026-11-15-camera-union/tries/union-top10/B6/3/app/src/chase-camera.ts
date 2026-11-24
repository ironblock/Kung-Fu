import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Below this length, the car's up is treated as lying along the line of sight.
// The projected up is then too small to give a stable direction, so the
// camera keeps its previous roll.
const DEGENERATE_EPSILON = 1e-6;

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    // The banked camera exposes an upVector that controls roll. Starting it at
    // world +Y makes the camera start upright.
    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: 0, y: 1, z: 0 },
    );

    const bank = (up: Vec): void => {
        // Line of sight, read from the camera so it stays correct if the camera moves.
        const fx = camera.target.x - camera.position.x;
        const fy = camera.target.y - camera.position.y;
        const fz = camera.target.z - camera.position.z;
        const fLen = Math.hypot(fx, fy, fz);
        if (fLen === 0) {
            return; // eye and target coincide: no view direction, keep roll
        }
        const dx = fx / fLen;
        const dy = fy / fLen;
        const dz = fz / fLen;

        // Remove the component of `up` along the line of sight. What remains is
        // the closest direction to `up` that is perpendicular to the view,
        // which is the roll the camera needs.
        const upLen = Math.hypot(up.x, up.y, up.z);
        if (upLen === 0) {
            return;
        }
        const ux = up.x / upLen;
        const uy = up.y / upLen;
        const uz = up.z / upLen;
        const d = ux * dx + uy * dy + uz * dz;
        const px = ux - d * dx;
        const py = uy - d * dy;
        const pz = uz - d * dz;
        const pLen = Math.hypot(px, py, pz);

        if (pLen < DEGENERATE_EPSILON) {
            return; // up is along the line of sight: keep previous roll
        }

        camera.upVector.x = px / pLen;
        camera.upVector.y = py / pLen;
        camera.upVector.z = pz / pLen;
    };

    return { camera, bank };
}
