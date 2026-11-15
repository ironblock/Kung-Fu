import { createBankedFreeCamera, type FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// The library builds its look-at basis from cross(up, forward) and, when that cross product is shorter
// than 1e-10, falls back to an identity rotation. A call that is this close to parallel is treated as
// degenerate here so the previous roll is kept instead of that fallback. Both vectors are unit length,
// so the cross product's length is the sine of the angle between them.
const DEGENERATE_SIN = 1e-9;

// Eye-to-target distance below which the line of sight is undefined.
const DEGENERATE_SPAN = 1e-10;

/**
 * A free camera at `eye` looking at `target` that rolls to follow the car's up direction.
 *
 * `bank(up)` makes the camera's picture-up the component of `up` perpendicular to the line of sight,
 * which is the closest the camera can get while it keeps looking at the target. When `up` is parallel
 * (or antiparallel) to the line of sight, the call does nothing, so the camera keeps its previous roll.
 * The camera starts upright, with world +Y as its up direction.
 */
export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const camera = createBankedFreeCamera({ x: eye.x, y: eye.y, z: eye.z }, { x: target.x, y: target.y, z: target.z });

    return {
        camera,
        bank(up: Vec): void {
            const ulen = Math.sqrt(up.x * up.x + up.y * up.y + up.z * up.z);
            if (!(ulen > 0)) {
                return;
            }
            const ux = up.x / ulen;
            const uy = up.y / ulen;
            const uz = up.z / ulen;

            // Current line of sight, read from the camera so the check follows any moves made elsewhere.
            const zx0 = camera.target.x - camera.position.x;
            const zy0 = camera.target.y - camera.position.y;
            const zz0 = camera.target.z - camera.position.z;
            const zlen = Math.sqrt(zx0 * zx0 + zy0 * zy0 + zz0 * zz0);
            if (zlen < DEGENERATE_SPAN) {
                return;
            }
            const zx = zx0 / zlen;
            const zy = zy0 / zlen;
            const zz = zz0 / zlen;

            // |up x forward| is the sine of the angle between them. Near zero, the roll is undefined.
            const sx = uy * zz - uz * zy;
            const sy = uz * zx - ux * zz;
            const sz = ux * zy - uy * zx;
            const sin = Math.sqrt(sx * sx + sy * sy + sz * sz);
            if (sin < DEGENERATE_SIN) {
                return;
            }

            // The library projects up onto the view plane itself (x = up x z, y = z x x), so the
            // unit up vector is all that needs to be stored. Writes mark the world matrix dirty.
            camera.upVector.set(ux, uy, uz);
        },
    };
}
