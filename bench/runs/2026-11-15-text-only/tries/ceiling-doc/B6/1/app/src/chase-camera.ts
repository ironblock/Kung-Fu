import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

/** Below this length, the part of `up` perpendicular to the line of sight counts as zero. */
const DEGENERATE_EPSILON = 1e-6;

/**
 * A chase camera that looks from `eye` at `target`, starts upright (world +Y)
 * and rolls each frame to follow the car's up direction.
 *
 * Built on `createBankedFreeCamera`, whose `upVector` feeds the look-at basis.
 * The library falls back to an identity rotation when the up vector is
 * parallel to the view direction (which would make the camera stop looking at
 * the target), so `bank` never hands it such a vector: it projects `up` onto
 * the plane perpendicular to the line of sight and, if nothing is left, keeps
 * the previous up vector (and so the previous roll).
 */
export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: 0, y: 1, z: 0 },
    );

    function bank(up: Vec): void {
        // Current line of sight (read live, in case position/target were moved).
        let fx = camera.target.x - camera.position.x;
        let fy = camera.target.y - camera.position.y;
        let fz = camera.target.z - camera.position.z;
        const fLen = Math.hypot(fx, fy, fz);
        if (fLen === 0) return; // eye on target: no defined view direction, keep roll
        fx /= fLen;
        fy /= fLen;
        fz /= fLen;

        // Remove the component of `up` along the line of sight. The look-at basis
        // depends only on this perpendicular part, so the resulting roll is the
        // closest match to `up` while still looking at the target.
        const d = up.x * fx + up.y * fy + up.z * fz;
        let ux = up.x - d * fx;
        let uy = up.y - d * fy;
        let uz = up.z - d * fz;
        const uLen = Math.hypot(ux, uy, uz);
        if (!(uLen > DEGENERATE_EPSILON)) return; // up along the line of sight (or NaN): keep previous roll
        ux /= uLen;
        uy /= uLen;
        uz /= uLen;

        const u = camera.upVector;
        if (u.x === ux && u.y === uy && u.z === uz) return;
        u.x = ux;
        u.y = uy;
        u.z = uz;
    }

    return { camera, bank };
}
