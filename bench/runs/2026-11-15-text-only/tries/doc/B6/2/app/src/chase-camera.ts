import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

// Below this sine of the angle between `up` and the line of sight, the requested
// up is treated as parallel to the view direction and the previous roll is kept.
const DEGENERATE_SIN_EPSILON = 1e-6;

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    // Starts upright: up = world +Y.
    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: 0, y: 1, z: 0 },
    );

    // Unit line of sight, eye -> target. Left-handed: +Z of the camera points at the target.
    const dx = target.x - eye.x;
    const dy = target.y - eye.y;
    const dz = target.z - eye.z;
    const dirLen = Math.hypot(dx, dy, dz);
    const zx = dirLen > 0 ? dx / dirLen : 0;
    const zy = dirLen > 0 ? dy / dirLen : 0;
    const zz = dirLen > 0 ? dz / dirLen : 0;

    function bank(up: Vec): void {
        const upLen = Math.hypot(up.x, up.y, up.z);
        if (!(upLen > 0) || !(dirLen > 0)) return;

        // |up x z| = |up| * sin(angle between up and the line of sight).
        const cx = up.y * zz - up.z * zy;
        const cy = up.z * zx - up.x * zz;
        const cz = up.x * zy - up.y * zx;
        const sinAngle = Math.hypot(cx, cy, cz) / upLen;
        if (sinAngle < DEGENERATE_SIN_EPSILON) {
            // Up is (nearly) along the line of sight: the roll is undefined.
            // Leave upVector untouched so the camera keeps looking at the target with its previous roll.
            return;
        }

        // The library builds its basis as x = normalize(up x z), y = z x x, which is the
        // component of `up` orthogonal to the view direction. That is the closest
        // achievable match to `up` in the picture while still looking at the target.
        const u = camera.upVector;
        u.x = up.x / upLen;
        u.y = up.y / upLen;
        u.z = up.z / upLen;
    }

    return { camera, bank };
}
