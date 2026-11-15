import type { FreeCamera } from "@babylonjs/lite";
import { createBankedFreeCamera } from "@babylonjs/lite";
import type { BankedFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

const WORLD_UP: Vec = { x: 0, y: 1, z: 0 };
const FALLBACK_UP: Vec = { x: 0, y: 0, z: 1 };

// Below this length the projected up is numerically meaningless (up is,
// to within rounding, along the line of sight), so the roll is left alone.
const DEGENERATE_EPS = 1e-9;

function sub(a: Vec, b: Vec): Vec {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function dot(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function length(v: Vec): number {
    return Math.sqrt(dot(v, v));
}

function scale(v: Vec, s: number): Vec {
    return { x: v.x * s, y: v.y * s, z: v.z * s };
}

// Component of `v` perpendicular to unit vector `n`.
function perpendicularTo(v: Vec, n: Vec): Vec {
    return sub(v, scale(n, dot(v, n)));
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const toTarget = sub(target, eye);
    const dist = length(toTarget);
    if (!(dist > 0)) {
        throw new Error("createChaseCamera: eye and target must differ");
    }
    const forward = scale(toTarget, 1 / dist);

    // Initial roll: upright, i.e. world up as projected into the picture.
    // If the view is exactly vertical, fall back to another reference axis.
    let upright = perpendicularTo(WORLD_UP, forward);
    if (length(upright) < DEGENERATE_EPS) {
        upright = perpendicularTo(FALLBACK_UP, forward);
    }
    upright = scale(upright, 1 / length(upright));

    const banked: BankedFreeCamera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        upright,
    );

    function bank(up: Vec): void {
        // Roll so the picture's up is the component of `up` perpendicular to
        // the line of sight. Position and target never change, so the camera
        // keeps looking at the target for any roll.
        const projected = perpendicularTo(up, forward);
        const len = length(projected);
        if (len < DEGENERATE_EPS) {
            // Up is along the line of sight: no roll is defined. Keep the
            // previous upVector untouched.
            return;
        }
        const s = 1 / len;
        banked.upVector.x = projected.x * s;
        banked.upVector.y = projected.y * s;
        banked.upVector.z = projected.z * s;
    }

    return { camera: banked, bank };
}
