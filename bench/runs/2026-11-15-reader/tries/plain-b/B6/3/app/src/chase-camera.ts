import { createBankedFreeCamera, type BankedFreeCamera, type FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

/** Below this length the wanted up is (numerically) on the line of sight, so no roll is defined. */
const DEGENERATE_EPSILON = 1e-9;

/**
 * Creates a camera at `eye` looking at `target`, starting upright (world +Y up).
 * Call `bank(up)` each frame to roll the camera so its picture-up follows `up`.
 */
export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const camera: BankedFreeCamera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: 0, y: 1, z: 0 },
    );

    return {
        camera,
        bank(up: Vec): void {
            const upLen = Math.hypot(up.x, up.y, up.z);
            if (upLen === 0) {
                return;
            }

            // Unit view direction from the camera toward its target.
            const eyePos = camera.position;
            const aim = camera.target;
            const fx0 = aim.x - eyePos.x;
            const fy0 = aim.y - eyePos.y;
            const fz0 = aim.z - eyePos.z;
            const fLen = Math.hypot(fx0, fy0, fz0);
            if (fLen === 0) {
                // Eye on target: no line of sight, keep the previous roll.
                return;
            }
            const fx = fx0 / fLen;
            const fy = fy0 / fLen;
            const fz = fz0 / fLen;

            // Unit up projected onto the plane perpendicular to the line of sight. This is the
            // closest direction to `up` that the camera can show while still looking at the target.
            const ux = up.x / upLen;
            const uy = up.y / upLen;
            const uz = up.z / upLen;
            const d = ux * fx + uy * fy + uz * fz;
            const px = ux - d * fx;
            const py = uy - d * fy;
            const pz = uz - d * fz;
            const pLen = Math.hypot(px, py, pz);
            if (pLen < DEGENERATE_EPSILON) {
                // Up lies along the line of sight (either way): keep looking at the target and keep the previous roll.
                return;
            }

            camera.upVector.set(px / pLen, py / pLen, pz / pLen);
        },
    };
}
