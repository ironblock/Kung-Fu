import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

// Relative threshold: the component of `up` along the line of sight is compared
// against |up| times this value. Below it the up direction is treated as parallel
// to the line of sight and the previous roll is kept.
const PARALLEL_EPSILON = 1e-9;

const WORLD_UP: Vec = { x: 0, y: 1, z: 0 };
const WORLD_Z: Vec = { x: 0, y: 0, z: 1 };

function dot(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function length(a: Vec): number {
    return Math.sqrt(dot(a, a));
}

function normalize(a: Vec): Vec {
    const l = length(a);
    return { x: a.x / l, y: a.y / l, z: a.z / l };
}

/**
 * Returns the unit vector closest to `up` that is perpendicular to the unit
 * vector `forward`, or null if `up` is (numerically) parallel to `forward`.
 */
function uprightFor(forward: Vec, up: Vec): Vec | null {
    const along = dot(up, forward);
    const perp = {
        x: up.x - along * forward.x,
        y: up.y - along * forward.y,
        z: up.z - along * forward.z,
    };
    const perpLength = length(perp);
    // !(a > b) also catches NaN.
    if (!(perpLength > PARALLEL_EPSILON * length(up))) return null;
    return { x: perp.x / perpLength, y: perp.y / perpLength, z: perp.z / perpLength };
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const toTarget = { x: target.x - eye.x, y: target.y - eye.y, z: target.z - eye.z };
    if (!(length(toTarget) > 0)) {
        throw new Error("createChaseCamera: eye and target must differ");
    }
    const forward = normalize(toTarget);

    // Start upright: world +Y, or +Z if the line of sight is vertical.
    const initial = uprightFor(forward, WORLD_UP) ?? uprightFor(forward, WORLD_Z);
    if (!initial) {
        // Unreachable: forward cannot be parallel to both Y and Z.
        throw new Error("createChaseCamera: could not find an initial up vector");
    }

    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: initial.x, y: initial.y, z: initial.z },
    );
    // Written in place: the camera keeps its own upVector object.
    const up = camera.upVector;

    return {
        camera,
        bank(upDir: Vec): void {
            const next = uprightFor(forward, upDir);
            if (!next) return; // Up is along the line of sight: keep the previous roll.
            up.x = next.x;
            up.y = next.y;
            up.z = next.z;
        },
    };
}
