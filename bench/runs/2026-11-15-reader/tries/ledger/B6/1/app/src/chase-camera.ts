import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Below this sine of the angle between the car's up and the line of sight, the two count as
// parallel. The library's look-at falls back to an identity basis at a much smaller value, so
// anything under this is kept out of the library entirely and the previous roll is held.
const PARALLEL_EPS = 1e-9;

/**
 * A FreeCamera at `eye` looking at `target`, starting upright (world +Y up). `bank(up)` rolls it so
 * that its picture-up is the projection of `up` onto the image plane. When `up` is parallel to the
 * line of sight the roll is undefined, so the camera keeps its previous roll.
 *
 * `eye` and `target` are copied; later changes to the caller's objects have no effect.
 */
export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const e: Vec = { x: eye.x, y: eye.y, z: eye.z };
    const t: Vec = { x: target.x, y: target.y, z: target.z };
    const camera = createBankedFreeCamera(e, t, { x: 0, y: 1, z: 0 });
    const upVector = camera.upVector;

    return {
        camera,
        bank(up: Vec): void {
            const ul = Math.hypot(up.x, up.y, up.z);
            if (!(ul > 0 && Number.isFinite(ul))) return;
            const ux = up.x / ul;
            const uy = up.y / ul;
            const uz = up.z / ul;

            let zx = t.x - e.x;
            let zy = t.y - e.y;
            let zz = t.z - e.z;
            const zl = Math.hypot(zx, zy, zz);
            if (!(zl > 0 && Number.isFinite(zl))) return;
            zx /= zl;
            zy /= zl;
            zz /= zl;

            // |up x line of sight| is the sine of the angle between them; ~0 means parallel.
            const cx = uy * zz - uz * zy;
            const cy = uz * zx - ux * zz;
            const cz = ux * zy - uy * zx;
            if (Math.hypot(cx, cy, cz) < PARALLEL_EPS) return;

            upVector.set(ux, uy, uz);
        },
    };
}
