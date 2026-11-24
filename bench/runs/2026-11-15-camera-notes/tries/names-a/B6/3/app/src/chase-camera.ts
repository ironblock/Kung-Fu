import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

// Below this length, the car's up is treated as lying along the line of sight.
const DEGENERATE_EPS = 1e-6;

function sub(a: Vec, b: Vec): Vec {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function scale(v: Vec, s: number): Vec {
    return { x: v.x * s, y: v.y * s, z: v.z * s };
}

function dot(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function len(v: Vec): number {
    return Math.hypot(v.x, v.y, v.z);
}

// The part of `v` perpendicular to the unit vector `forward`, normalized to unit length.
// Returns null when `v` is (nearly) parallel to `forward`, so no roll is defined.
function perpendicularUnit(v: Vec, forward: Vec): Vec | null {
    const p = sub(v, scale(forward, dot(v, forward)));
    const n = len(p);
    if (!(n > DEGENERATE_EPS)) return null;
    return scale(p, 1 / n);
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const d = sub(target, eye);
    const dl = len(d);
    if (!(dl > 0)) {
        throw new Error("createChaseCamera: eye and target must be distinct");
    }
    const forward = scale(d, 1 / dl);

    // Start upright: world Y projected onto the view plane. If the view is exactly
    // vertical that projection vanishes, so fall back to world Z.
    const initialUp =
        perpendicularUnit({ x: 0, y: 1, z: 0 }, forward) ??
        perpendicularUnit({ x: 0, y: 0, z: 1 }, forward)!;

    // eye and target never change, so `forward` is fixed for the life of the camera.
    // Rolling only means changing the up vector; a degenerate call just skips the write,
    // which keeps the previous roll.
    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        initialUp,
    );

    return {
        camera,
        bank(up: Vec): void {
            const roll = perpendicularUnit(up, forward);
            if (roll === null) return;
            const u = camera.upVector;
            u.x = roll.x;
            u.y = roll.y;
            u.z = roll.z;
        },
    };
}
