import { createBankedFreeCamera, type BankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    /** Roll the camera so its picture-up matches `up` as closely as possible while it keeps looking at the target. */
    bank(up: Vec): void;
}

/** Below this length (relative to the input `up`), the car's up is treated as parallel to the line of sight. */
const PARALLEL_EPSILON = 1e-9;

/**
 * Creates a camera at `eye` looking at `target`, starting upright (world +Y), that can roll to follow a supplied up.
 *
 * The library builds the camera basis as x = cross(up, z), y = cross(z, x), where z is the unit line of sight.
 * Feeding it the component of `up` perpendicular to z therefore makes the picture-up equal to that component,
 * which is the closest achievable roll. When `up` is (nearly) parallel to the line of sight the roll is
 * undefined, so the previous up vector is kept. Passing such a vector to the library directly would make it
 * fall back to an identity rotation, which would reset the roll.
 */
export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const camera: BankedFreeCamera = createBankedFreeCamera(eye, target, { x: 0, y: 1, z: 0 });

    // Unit line of sight from eye to target. The camera is positioned once and never moves, so this is fixed.
    const dx = target.x - eye.x;
    const dy = target.y - eye.y;
    const dz = target.z - eye.z;
    const dLen = Math.hypot(dx, dy, dz);
    const viewable = dLen > 0 && Number.isFinite(dLen);
    const zx = viewable ? dx / dLen : 0;
    const zy = viewable ? dy / dLen : 0;
    const zz = viewable ? dz / dLen : 0;

    return {
        camera,
        bank(up: Vec): void {
            if (!viewable) return;
            const upLen = Math.hypot(up.x, up.y, up.z);
            if (!(upLen > 0) || !Number.isFinite(upLen)) return;

            // Component of up perpendicular to the line of sight: p = up - (up·z) z.
            const ux = up.x / upLen;
            const uy = up.y / upLen;
            const uz = up.z / upLen;
            const d = ux * zx + uy * zy + uz * zz;
            const px = ux - d * zx;
            const py = uy - d * zy;
            const pz = uz - d * zz;
            const pLen = Math.hypot(px, py, pz);

            // Up is (nearly) along the line of sight: keep the previous up, and therefore the previous roll.
            if (pLen < PARALLEL_EPSILON) return;

            camera.upVector.set(px / pLen, py / pLen, pz / pLen);
        },
    };
}
