import type { FreeCamera } from "@babylonjs/lite";
import { createBankedFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Below this sine of the angle between `up` and the line of sight, the roll is
// undefined and bank() keeps the previous roll.
const PARALLEL_EPSILON = 1e-6;

function dot(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function length(a: Vec): number {
    return Math.sqrt(dot(a, a));
}

/**
 * Component of `v` perpendicular to the unit vector `forward`, normalized.
 * Returns null when `v` is zero or (nearly) parallel to `forward`.
 */
function perpendicularUnit(v: Vec, forward: Vec): Vec | null {
    const vl = length(v);
    if (!(vl > 0)) return null;
    const ux = v.x / vl;
    const uy = v.y / vl;
    const uz = v.z / vl;
    const d = ux * forward.x + uy * forward.y + uz * forward.z;
    const px = ux - d * forward.x;
    const py = uy - d * forward.y;
    const pz = uz - d * forward.z;
    const pl = Math.sqrt(px * px + py * py + pz * pz);
    if (!(pl > PARALLEL_EPSILON)) return null; // also rejects NaN
    return { x: px / pl, y: py / pl, z: pz / pl };
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const view = { x: target.x - eye.x, y: target.y - eye.y, z: target.z - eye.z };
    const viewLength = length(view);
    if (!(viewLength > 0)) {
        throw new Error("createChaseCamera: eye and target must differ");
    }
    // Line of sight; the camera always looks along this, since eye and target are fixed.
    const forward: Vec = {
        x: view.x / viewLength,
        y: view.y / viewLength,
        z: view.z / viewLength,
    };

    // Start upright: world up projected onto the image plane. If the line of sight
    // is vertical, fall back to world Z (it cannot be parallel to both axes).
    const startUp =
        perpendicularUnit({ x: 0, y: 1, z: 0 }, forward) ??
        perpendicularUnit({ x: 0, y: 0, z: 1 }, forward) ??
        { x: 1, y: 0, z: 0 };

    const banked = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: startUp.x, y: startUp.y, z: startUp.z },
    );

    return {
        camera: banked,
        bank(up: Vec): void {
            // Project `up` onto the image plane so the roll is always perpendicular
            // to the line of sight. A parallel `up` leaves upVector untouched, so the
            // camera keeps its previous roll and its target.
            const next = perpendicularUnit(up, forward);
            if (next === null) return;
            banked.upVector.x = next.x;
            banked.upVector.y = next.y;
            banked.upVector.z = next.z;
        },
    };
}
