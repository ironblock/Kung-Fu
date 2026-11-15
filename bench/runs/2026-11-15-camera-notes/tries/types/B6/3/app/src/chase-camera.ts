import type { FreeCamera } from "@babylonjs/lite";
import { createBankedFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

/**
 * Below this length, the component of the car's up that is perpendicular to the
 * line of sight is treated as zero (up is effectively parallel to the view
 * direction). In that case the roll is left unchanged.
 */
const DEGENERATE_EPSILON = 1e-6;

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    // Fixed line of sight: the camera never moves, so this is computed once.
    const fx = target.x - eye.x;
    const fy = target.y - eye.y;
    const fz = target.z - eye.z;
    const fLen = Math.hypot(fx, fy, fz);
    const forward = { x: fx / fLen, y: fy / fLen, z: fz / fLen };

    // Start upright (world +Y). The library builds its look-at basis from
    // upVector, so writing upVector is what rolls the camera.
    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: 0, y: 1, z: 0 },
    );
    const upVector = camera.upVector;

    return {
        camera,
        bank(up: Vec): void {
            // Remove the component of up along the line of sight. What remains is
            // the closest direction to up that lies in the picture plane, so the
            // screen-up of the camera is as close to up as it can be.
            const d = up.x * forward.x + up.y * forward.y + up.z * forward.z;
            const px = up.x - d * forward.x;
            const py = up.y - d * forward.y;
            const pz = up.z - d * forward.z;
            const pLen = Math.hypot(px, py, pz);

            // Up is (numerically) along the line of sight: no roll is defined.
            // Do not write upVector, so the camera keeps its previous roll. Writing
            // a degenerate up would make the library fall back to an identity basis.
            // The negated test also catches NaN.
            if (!(pLen > DEGENERATE_EPSILON)) {
                return;
            }

            upVector.x = px / pLen;
            upVector.y = py / pLen;
            upVector.z = pz / pLen;
        },
    };
}
