import { createBankedFreeCamera, type FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

/** Relative length below which a direction counts as parallel to the view direction. */
const PARALLEL_EPS = 1e-9;

const WORLD_Y: Vec = { x: 0, y: 1, z: 0 };
const WORLD_Z: Vec = { x: 0, y: 0, z: 1 };
const WORLD_X: Vec = { x: 1, y: 0, z: 0 };

/** Unit view direction from `from` to `to`, or null when the two points coincide. */
function viewDirection(from: Vec, to: Vec): Vec | null {
    const x = to.x - from.x;
    const y = to.y - from.y;
    const z = to.z - from.z;
    const len = Math.hypot(x, y, z);
    if (!(len > 0)) return null;
    return { x: x / len, y: y / len, z: z / len };
}

/**
 * The unit vector closest to `v` that is perpendicular to the unit view direction `f`, i.e. the
 * picture-up that best matches `v` for a camera looking along `f`. Null when `v` is (nearly)
 * parallel to `f`, or is not a usable direction at all.
 */
function pictureUp(v: Vec, f: Vec): Vec | null {
    const vLen = Math.hypot(v.x, v.y, v.z);
    if (!(vLen > 0)) return null;
    const ux = v.x / vLen;
    const uy = v.y / vLen;
    const uz = v.z / vLen;
    const d = ux * f.x + uy * f.y + uz * f.z;
    const px = ux - d * f.x;
    const py = uy - d * f.y;
    const pz = uz - d * f.z;
    const pLen = Math.hypot(px, py, pz);
    // !(x > eps) also rejects NaN.
    if (!(pLen > PARALLEL_EPS)) return null;
    return { x: px / pLen, y: py / pLen, z: pz / pLen };
}

/**
 * Creates a chase camera that starts upright and can be rolled to follow a vehicle's up direction.
 * The camera stays at `eye` and keeps looking at `target` (move them through `camera.position` and
 * `camera.target` as usual). Each `bank(up)` call rolls the camera so its picture-up is the
 * projection of `up` onto the view plane. If `up` is parallel to the view direction, the roll is
 * left as it was, re-projected onto the current view plane.
 */
export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const f0 = viewDirection(eye, target) ?? WORLD_Z;
    // Upright start. The world-Y, Z and X candidates cannot all be parallel to one direction, so
    // the last one always resolves.
    let last: Vec =
        pictureUp(WORLD_Y, f0) ?? pictureUp(WORLD_Z, f0) ?? (pictureUp(WORLD_X, f0) as Vec);

    const banked = createBankedFreeCamera(eye, target, last);

    return {
        camera: banked,
        bank(up: Vec): void {
            const cam = banked;
            const f = viewDirection(cam.position, cam.target);
            // Eye on target: there is no view direction, so there is no roll to set.
            if (f === null) return;

            const p =
                pictureUp(up, f) ??
                pictureUp(last, f) ??
                pictureUp(WORLD_Y, f) ??
                pictureUp(WORLD_Z, f) ??
                (pictureUp(WORLD_X, f) as Vec);
            last = p;

            const current = cam.upVector;
            if (current.x !== p.x || current.y !== p.y || current.z !== p.z) {
                current.set(p.x, p.y, p.z);
            }
        },
    };
}
