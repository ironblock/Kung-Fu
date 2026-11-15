import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

/** Relative tolerance: an up vector whose component across the line of sight is
 *  smaller than this fraction of its length counts as parallel to the view. */
const PARALLEL_EPS = 1e-9;

/**
 * Component of `u` perpendicular to the unit view direction `f`, normalized.
 * Returns undefined when `u` is (numerically) parallel to `f`, zero, or non-finite.
 */
function perpendicularUnit(f: Vec, u: Vec): Vec | undefined {
    const d = u.x * f.x + u.y * f.y + u.z * f.z;
    const px = u.x - d * f.x;
    const py = u.y - d * f.y;
    const pz = u.z - d * f.z;
    const len = Math.hypot(px, py, pz);
    const ulen = Math.hypot(u.x, u.y, u.z);
    if (!(len > PARALLEL_EPS * ulen)) return undefined;
    return { x: px / len, y: py / len, z: pz / len };
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const dx = target.x - eye.x;
    const dy = target.y - eye.y;
    const dz = target.z - eye.z;
    const dlen = Math.hypot(dx, dy, dz);
    if (!(dlen > 0) || !Number.isFinite(dlen)) {
        throw new RangeError("createChaseCamera: eye and target must be distinct, finite points");
    }
    const forward: Vec = { x: dx / dlen, y: dy / dlen, z: dz / dlen };

    // Start upright: world +Y across the line of sight. If the view is vertical,
    // +Y has no perpendicular component, so fall back to +X (a choice, not a spec).
    let roll: Vec =
        perpendicularUnit(forward, { x: 0, y: 1, z: 0 }) ??
        perpendicularUnit(forward, { x: 1, y: 0, z: 0 })!;

    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: roll.x, y: roll.y, z: roll.z },
    );

    return {
        camera,
        bank(up: Vec): void {
            const next = perpendicularUnit(forward, up);
            // Degenerate (up along the line of sight, or bad input): keep the previous roll.
            if (!next) return;
            roll = next;
            const v = camera.upVector;
            v.x = roll.x;
            v.y = roll.y;
            v.z = roll.z;
        },
    };
}
