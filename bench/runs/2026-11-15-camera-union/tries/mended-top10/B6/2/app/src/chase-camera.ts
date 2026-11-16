import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Below this length, a vector is treated as zero (parallel/degenerate).
const EPS = 1e-6;

function dot(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function normalize(v: Vec): Vec | null {
    const l = Math.hypot(v.x, v.y, v.z);
    if (!(l > EPS)) return null;
    return { x: v.x / l, y: v.y / l, z: v.z / l };
}

// Unit vector of `up` projected onto the plane perpendicular to the unit
// forward vector `f`. Returns null when `up` is (nearly) parallel to `f`.
function screenUp(up: Vec, f: Vec): Vec | null {
    const d = dot(up, f);
    return normalize({
        x: up.x - d * f.x,
        y: up.y - d * f.y,
        z: up.z - d * f.z,
    });
}

function forwardOf(camera: FreeCamera): Vec | null {
    return normalize({
        x: camera.target.x - camera.position.x,
        y: camera.target.y - camera.position.y,
        z: camera.target.z - camera.position.z,
    });
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const f0 = normalize({
        x: target.x - eye.x,
        y: target.y - eye.y,
        z: target.z - eye.z,
    });

    // Start upright: world +Y projected onto the view plane. Fall back to
    // +Z, then +X, only if the view direction is itself (nearly) vertical.
    let lastUp: Vec =
        (f0 && screenUp({ x: 0, y: 1, z: 0 }, f0)) ||
        (f0 && screenUp({ x: 0, y: 0, z: 1 }, f0)) ||
        { x: 0, y: 1, z: 0 };

    const camera = createBankedFreeCamera(eye, target, lastUp);

    function bank(up: Vec): void {
        const f = forwardOf(camera);
        if (!f) return; // eye and target coincide: no orientation to set

        const unitUp = normalize(up);
        // The best achievable roll is the desired up projected into the view
        // plane. If the desired up is along the line of sight (or missing),
        // keep the previous roll: re-project the last screen up onto the
        // current view plane so the roll angle is unchanged.
        const next =
            (unitUp && screenUp(unitUp, f)) ||
            screenUp(lastUp, f) ||
            lastUp;

        lastUp = next;
        camera.upVector.x = next.x;
        camera.upVector.y = next.y;
        camera.upVector.z = next.z;
    }

    return { camera, bank };
}
