import { createBankedFreeCamera, type FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Below this length, the projected up is treated as zero (up is along the line of sight).
const DEGENERATE_EPSILON = 1e-6;

function dot(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function normalize(v: Vec): Vec {
    const len = Math.hypot(v.x, v.y, v.z);
    if (len === 0) {
        throw new Error("Zero-length vector");
    }
    return { x: v.x / len, y: v.y / len, z: v.z / len };
}

// Removes the component of v along the unit vector f.
function removeAlong(v: Vec, f: Vec): Vec {
    const d = dot(v, f);
    return { x: v.x - d * f.x, y: v.y - d * f.y, z: v.z - d * f.z };
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const forward = normalize({
        x: target.x - eye.x,
        y: target.y - eye.y,
        z: target.z - eye.z,
    });

    // Upright start: world +Y made perpendicular to the line of sight.
    // If looking straight along Y, fall back to +Z.
    let initialUp = removeAlong({ x: 0, y: 1, z: 0 }, forward);
    if (Math.hypot(initialUp.x, initialUp.y, initialUp.z) < DEGENERATE_EPSILON) {
        initialUp = removeAlong({ x: 0, y: 0, z: 1 }, forward);
    }
    initialUp = normalize(initialUp);

    const camera = createBankedFreeCamera(eye, target, initialUp);

    // Last accepted roll direction (unit, perpendicular to forward).
    // Kept as the stored upVector so a degenerate call simply leaves it alone.
    const bank = (up: Vec): void => {
        const u = normalize(up);
        const projected = removeAlong(u, forward);
        const len = Math.hypot(projected.x, projected.y, projected.z);
        if (len < DEGENERATE_EPSILON) {
            // Up is (nearly) along the line of sight: keep the previous roll.
            return;
        }
        const roll = { x: projected.x / len, y: projected.y / len, z: projected.z / len };
        camera.upVector.x = roll.x;
        camera.upVector.y = roll.y;
        camera.upVector.z = roll.z;
    };

    return { camera, bank };
}
