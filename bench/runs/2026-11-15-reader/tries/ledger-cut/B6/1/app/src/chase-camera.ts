import { createBankedFreeCamera, type FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

/** Sine of the angle between the car's up and the line of sight below which the two count as parallel.
 *  A exactly parallel up computed in floating point lands far below this; a real bank lands far above. */
const PARALLEL_EPS = 1e-6;
/** Smallest length treated as a real vector (eye on target, or a zero up). */
const MIN_LEN = 1e-10;

/** Camera at `eye` looking at `target`, starting upright, whose roll follows the car's up on each `bank` call.
 *
 *  The library's look-at uses the up vector it is given, so writing the car's up (projected onto the plane
 *  perpendicular to the line of sight) rolls the picture to match it as closely as possible. Writes go
 *  through the camera's `upVector`, which bumps `worldMatrixVersion`, so the view matrix is rebuilt.
 *
 *  When the car's up is parallel to the line of sight there is no roll to match. The library would fall back
 *  to an identity rotation there, so this module reuses the last picture-up instead, re-projected onto the
 *  current line of sight. The target stays in view in both cases. */
export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const camera = createBankedFreeCamera({ x: eye.x, y: eye.y, z: eye.z }, { x: target.x, y: target.y, z: target.z });
    const upVector = camera.upVector;
    // Unit picture-up of the current roll, perpendicular to the line of sight. Starts at world up (upright).
    let picUp: Vec = { x: 0, y: 1, z: 0 };

    function bank(up: Vec): void {
        // Live line of sight, so the view matches whatever the camera currently looks along.
        const zx0 = camera.target.x - camera.position.x;
        const zy0 = camera.target.y - camera.position.y;
        const zz0 = camera.target.z - camera.position.z;
        const zLen = Math.hypot(zx0, zy0, zz0);
        const uLen = Math.hypot(up.x, up.y, up.z);
        if (zLen < MIN_LEN || uLen < MIN_LEN) {
            return;
        }
        const zx = zx0 / zLen;
        const zy = zy0 / zLen;
        const zz = zz0 / zLen;

        // Car's up with its component along the line of sight removed.
        const ux = up.x / uLen;
        const uy = up.y / uLen;
        const uz = up.z / uLen;
        const along = ux * zx + uy * zy + uz * zz;
        const px = ux - zx * along;
        const py = uy - zy * along;
        const pz = uz - zz * along;
        const pLen = Math.hypot(px, py, pz); // sine of the angle between up and the line of sight

        let next: Vec;
        if (pLen > PARALLEL_EPS) {
            next = { x: px / pLen, y: py / pLen, z: pz / pLen };
        } else {
            // Parallel: keep the previous roll. Re-project the last picture-up onto the current line of sight.
            const q = picUp.x * zx + picUp.y * zy + picUp.z * zz;
            const qx = picUp.x - zx * q;
            const qy = picUp.y - zy * q;
            const qz = picUp.z - zz * q;
            const qLen = Math.hypot(qx, qy, qz);
            if (qLen < PARALLEL_EPS) {
                return;
            }
            next = { x: qx / qLen, y: qy / qLen, z: qz / qLen };
        }

        picUp = next;
        // Per-component setters notify only on change, so an unchanged roll does not bump the camera version.
        upVector.x = next.x;
        upVector.y = next.y;
        upVector.z = next.z;
    }

    return { camera, bank };
}
