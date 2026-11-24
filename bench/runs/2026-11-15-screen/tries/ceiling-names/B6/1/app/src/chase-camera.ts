import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

/**
 * If the part of an up direction that is perpendicular to the line of sight
 * is shorter than this (relative to the up vector's length), the up direction
 * counts as lying along the line of sight. It then says nothing about roll.
 * This is the sine of the angle between the two directions (about 0.0006°).
 * It is well above float32 rounding noise, so an up that is "exactly" along
 * the line of sight but carries rounding error is still caught.
 */
const ALONG_SIGHT_EPSILON = 1e-5;

const WORLD_UP: Vec = { x: 0, y: 1, z: 0 };
const WORLD_FORWARD: Vec = { x: 0, y: 0, z: 1 };

/** Writes the unit direction from `from` to `to` into `out`. Returns false if there is none. */
function directionTo(from: Vec, to: Vec, out: Vec): boolean {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dz = to.z - from.z;
    const len = Math.hypot(dx, dy, dz);
    if (!(len > 0) || !Number.isFinite(len)) return false;
    out.x = dx / len;
    out.y = dy / len;
    out.z = dz / len;
    return true;
}

/**
 * Writes into `out` the unit vector perpendicular to the unit direction `sight`
 * that is closest to `v`, which is `v` with its part along `sight` taken out and
 * then normalized. Returns false if `v` lies along `sight` (or is zero or not
 * finite). In that case no such vector is defined and `out` is left unchanged.
 */
function perpendicularUnit(v: Vec, sight: Vec, out: Vec): boolean {
    const vLen = Math.hypot(v.x, v.y, v.z);
    if (!(vLen > 0) || !Number.isFinite(vLen)) return false;
    const along = v.x * sight.x + v.y * sight.y + v.z * sight.z;
    const px = v.x - along * sight.x;
    const py = v.y - along * sight.y;
    const pz = v.z - along * sight.z;
    const pLen = Math.hypot(px, py, pz);
    if (!(pLen > ALONG_SIGHT_EPSILON * vLen)) return false;
    out.x = px / pLen;
    out.y = py / pLen;
    out.z = pz / pLen;
    return true;
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    // Start upright: world up, made perpendicular to the line of sight. If we
    // look straight up or down, world up gives no roll, so use world forward.
    const sight: Vec = { x: 0, y: 0, z: 1 };
    const initialUp: Vec = { ...WORLD_UP };
    if (directionTo(eye, target, sight) && !perpendicularUnit(WORLD_UP, sight, initialUp)) {
        perpendicularUnit(WORLD_FORWARD, sight, initialUp);
    }

    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        initialUp,
    );

    // Reused every frame so bank() does not allocate.
    const screenUp: Vec = { x: 0, y: 0, z: 0 };

    function bank(up: Vec): void {
        // Read the live position and target, so this still works if the caller
        // moves the camera along the track between calls.
        if (!directionTo(camera.position, camera.target, sight)) return;

        // The best roll puts the picture's up along the part of `up` that is
        // perpendicular to the line of sight. If `up` lies along the line of
        // sight (either way), there is no such part: leave upVector alone so
        // the camera keeps its previous roll.
        if (!perpendicularUnit(up, sight, screenUp)) return;

        // Position and target are never touched, so the camera keeps looking
        // at the target. Only the up vector changes, and the value written is
        // a unit vector exactly perpendicular to the view direction.
        const u = camera.upVector;
        u.x = screenUp.x;
        u.y = screenUp.y;
        u.z = screenUp.z;
    }

    return { camera, bank };
}
