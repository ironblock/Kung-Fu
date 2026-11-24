import { createBankedFreeCamera, type FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

/** Projected up vectors shorter than this (relative to the input up) are treated as "along the line of sight".
 *  Larger than the library's own 1e-10 fallback so that float32-rounded inputs that are exactly parallel
 *  to the view direction are caught instead of producing an arbitrary roll. */
const DEGENERATE_EPSILON = 1e-6;

/**
 * A camera at `eye` looking at `target` that rolls so its up matches the caller's up as closely as possible.
 * Starts upright (world +Y). Calls where up is parallel to the view direction keep the previous roll.
 */
export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const camera = createBankedFreeCamera(eye, target);

    // The eye and target are fixed for this camera, so the view direction is computed once.
    const dx = target.x - eye.x;
    const dy = target.y - eye.y;
    const dz = target.z - eye.z;
    const dLen = Math.hypot(dx, dy, dz);
    // Eye exactly on target: there is no line of sight to roll around, so banking is a no-op.
    const forward = dLen > 0 ? { x: dx / dLen, y: dy / dLen, z: dz / dLen } : null;

    // Last accepted up direction (already perpendicular to the view direction). Starts upright.
    let roll: Vec = { x: 0, y: 1, z: 0 };

    return {
        camera,
        bank(up: Vec): void {
            if (forward === null) return;
            const upLen = Math.hypot(up.x, up.y, up.z);
            if (!(upLen > 0)) return;

            // Remove the component of up along the view direction: this is the closest in-picture up
            // the camera can show while still looking at the target.
            const ux = up.x / upLen;
            const uy = up.y / upLen;
            const uz = up.z / upLen;
            const along = ux * forward.x + uy * forward.y + uz * forward.z;
            const px = ux - along * forward.x;
            const py = uy - along * forward.y;
            const pz = uz - along * forward.z;
            const pLen = Math.hypot(px, py, pz);

            // Up is (numerically) along the line of sight: keep looking at the target and keep the previous roll.
            if (!(pLen > DEGENERATE_EPSILON)) return;

            roll = { x: px / pLen, y: py / pLen, z: pz / pLen };
            camera.upVector.set(roll.x, roll.y, roll.z);
        },
    };
}
