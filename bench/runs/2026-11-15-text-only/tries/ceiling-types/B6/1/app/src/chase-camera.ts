import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

/** Below this (sine of the angle between `up` and the line of sight) the up
 *  direction is treated as lying along the view direction and cannot define a roll. */
const PARALLEL_EPSILON = 1e-6;

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    // A plain FreeCamera always builds its basis against world +Y and cannot roll;
    // the banked variant exposes a mutable up vector. Start upright (world +Y).
    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: 0, y: 1, z: 0 },
    );

    function bank(up: Vec): void {
        // Current line of sight (read live, in case the caller moved eye/target).
        const fx = camera.target.x - camera.position.x;
        const fy = camera.target.y - camera.position.y;
        const fz = camera.target.z - camera.position.z;
        const fLen = Math.hypot(fx, fy, fz);
        const upLen = Math.hypot(up.x, up.y, up.z);
        if (!(fLen > 0) || !(upLen > 0)) return;

        // |forward x up| / (|forward| |up|) = sin(angle). When the car's up points
        // along the line of sight (either way) it defines no roll, and the library
        // would fall back to an identity rotation. Skip the write so the camera keeps
        // looking at the target with its previous roll.
        const cx = fy * up.z - fz * up.y;
        const cy = fz * up.x - fx * up.z;
        const cz = fx * up.y - fy * up.x;
        if (Math.hypot(cx, cy, cz) <= PARALLEL_EPSILON * fLen * upLen) return;

        // The look-at basis keeps the view direction fixed and uses the component
        // of `up` perpendicular to it, which is the closest achievable match.
        camera.upVector.x = up.x;
        camera.upVector.y = up.y;
        camera.upVector.z = up.z;
    }

    return { camera, bank };
}
