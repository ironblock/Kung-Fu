import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

/**
 * Below this sine of the angle between `up` and the line of sight, the up
 * direction is treated as parallel to the view direction and the roll is kept.
 */
const PARALLEL_EPS = 1e-6;

/**
 * Creates a camera at `eye` looking at `target`, starting upright. Call
 * `bank(up)` each frame with the car's unit up direction to roll the camera so
 * its picture-up follows `up` as closely as possible while it keeps looking at
 * `target`.
 */
export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
    );

    // The line of sight is fixed for this camera (eye and target never move),
    // so the forward direction is computed once.
    const fx0 = target.x - eye.x;
    const fy0 = target.y - eye.y;
    const fz0 = target.z - eye.z;
    const fLen = Math.hypot(fx0, fy0, fz0);
    const fx = fx0 / fLen;
    const fy = fy0 / fLen;
    const fz = fz0 / fLen;

    return {
        camera,
        bank(up: Vec): void {
            // |cross(up, forward)| / |up| = sin(angle between up and forward).
            const uLen = Math.hypot(up.x, up.y, up.z);
            const cx = up.y * fz - up.z * fy;
            const cy = up.z * fx - up.x * fz;
            const cz = up.x * fy - up.y * fx;
            const sine = Math.hypot(cx, cy, cz) / uLen;

            // Degenerate (up along the line of sight, or a zero/NaN up): leave
            // the upVector untouched so the camera keeps its previous roll. Writing
            // it here would make the library fall back to an identity rotation.
            // The negated comparison also rejects NaN.
            if (!(sine > PARALLEL_EPS)) {
                return;
            }

            // The library's look-at builds yAxis = cross(z, cross(up, z)), which is
            // the component of `up` perpendicular to the line of sight, so passing
            // `up` directly gives the closest achievable roll.
            camera.upVector.x = up.x;
            camera.upVector.y = up.y;
            camera.upVector.z = up.z;
        },
    };
}
