import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Below this length the wanted up is (numerically) along the line of sight,
// so there is no roll to aim for and the previous roll is kept.
const DEGENERATE_EPSILON = 1e-6;

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    // Starts upright: world +Y as the up direction.
    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: 0, y: 1, z: 0 },
    );

    // Unit line of sight, eye -> target. The camera does not move, so this is fixed.
    const fx0 = target.x - eye.x;
    const fy0 = target.y - eye.y;
    const fz0 = target.z - eye.z;
    const fl = Math.hypot(fx0, fy0, fz0);
    const fx = fx0 / fl;
    const fy = fy0 / fl;
    const fz = fz0 / fl;

    return {
        camera,
        bank(up: Vec): void {
            // Remove the along-sight part of `up`. What is left is the closest
            // vector to `up` that is perpendicular to the line of sight, which
            // is the best possible picture-up for this camera.
            const d = up.x * fx + up.y * fy + up.z * fz;
            const px = up.x - d * fx;
            const py = up.y - d * fy;
            const pz = up.z - d * fz;
            const len = Math.hypot(px, py, pz);

            // Degenerate (up along the line of sight, or NaN): keep the previous roll.
            if (!(len > DEGENERATE_EPSILON)) {
                return;
            }

            const s = 1 / len;
            const ub = camera.upVector;
            ub.x = px * s;
            ub.y = py * s;
            ub.z = pz * s;
        },
    };
}
