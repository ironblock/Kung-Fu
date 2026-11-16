import { createBankedFreeCamera } from "@babylonjs/lite";
import type { BankedFreeCamera, FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

// Below this length, a vector is treated as zero or parallel to the line of sight.
const EPS = 1e-6;

function dot(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function length(a: Vec): number {
    return Math.sqrt(dot(a, a));
}

function normalize(a: Vec): Vec | null {
    const l = length(a);
    if (!(l > EPS)) return null;
    return { x: a.x / l, y: a.y / l, z: a.z / l };
}

// Projects `up` onto the plane perpendicular to the unit forward vector `fwd`
// and normalizes the result. This is the in-picture up closest to `up` that
// keeps the camera looking along `fwd`. Returns null when `up` is zero or
// parallel to `fwd`, so the caller can keep its previous roll.
function projectUp(fwd: Vec, up: Vec): Vec | null {
    const u = normalize(up);
    if (!u) return null;
    const d = dot(u, fwd);
    const p = {
        x: u.x - d * fwd.x,
        y: u.y - d * fwd.y,
        z: u.z - d * fwd.z,
    };
    return normalize(p);
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const fwd = normalize({
        x: target.x - eye.x,
        y: target.y - eye.y,
        z: target.z - eye.z,
    });
    if (!fwd) {
        throw new Error("createChaseCamera: eye and target must be distinct");
    }

    // Start upright: world +Y projected onto the view plane. If the view
    // direction is vertical, fall back to world +Z. Both cannot be parallel
    // to the same unit vector, so one of them always works.
    let initialUp = projectUp(fwd, { x: 0, y: 1, z: 0 });
    if (!initialUp) {
        initialUp = projectUp(fwd, { x: 0, y: 0, z: 1 });
    }
    if (!initialUp) {
        throw new Error("createChaseCamera: could not derive an initial up vector");
    }

    const camera: BankedFreeCamera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: initialUp.x, y: initialUp.y, z: initialUp.z },
    );

    return {
        camera,
        bank(upDir: Vec): void {
            const next = projectUp(fwd, upDir);
            if (!next) {
                // Degenerate: up is along the line of sight. Leave the camera
                // (look direction and roll) untouched.
                return;
            }
            camera.upVector.x = next.x;
            camera.upVector.y = next.y;
            camera.upVector.z = next.z;
        },
    };
}
