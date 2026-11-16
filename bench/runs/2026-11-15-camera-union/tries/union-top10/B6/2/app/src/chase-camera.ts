import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Below this length, the car's up is treated as lying along the line of sight
// and the previous roll is kept.
const DEGENERATE_EPSILON = 1e-6;

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    // Starts upright: world +Y as the up direction.
    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: 0, y: 1, z: 0 },
    );

    const bank = (up: Vec): void => {
        // Line of sight from the camera's current position to its current target.
        const p = camera.position;
        const t = camera.target;
        let fx = t.x - p.x;
        let fy = t.y - p.y;
        let fz = t.z - p.z;
        const fLen = Math.hypot(fx, fy, fz);
        if (!(fLen > 0) || !Number.isFinite(fLen)) {
            return; // no defined line of sight; keep the current pose
        }
        fx /= fLen;
        fy /= fLen;
        fz /= fLen;

        const uLen = Math.hypot(up.x, up.y, up.z);
        if (!(uLen > 0) || !Number.isFinite(uLen)) {
            return; // no usable up direction; keep the current roll
        }
        const ux = up.x / uLen;
        const uy = up.y / uLen;
        const uz = up.z / uLen;

        // Remove the component of up along the line of sight. What remains is the
        // closest direction to the car's up that is perpendicular to the view.
        const d = ux * fx + uy * fy + uz * fz;
        const wx = ux - d * fx;
        const wy = uy - d * fy;
        const wz = uz - d * fz;
        const wLen = Math.hypot(wx, wy, wz);

        if (wLen < DEGENERATE_EPSILON) {
            // Up is (nearly) along the line of sight: roll is undefined, keep the previous one.
            return;
        }

        const upVector = camera.upVector;
        upVector.x = wx / wLen;
        upVector.y = wy / wLen;
        upVector.z = wz / wLen;
    };

    return { camera, bank };
}
