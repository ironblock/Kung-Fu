import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

const EPS = 1e-9;

function sub(a: Vec, b: Vec): Vec {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function dot(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function scale(a: Vec, s: number): Vec {
    return { x: a.x * s, y: a.y * s, z: a.z * s };
}

function len(a: Vec): number {
    return Math.sqrt(dot(a, a));
}

/**
 * Component of `up` perpendicular to the unit line of sight `forward`, normalized.
 * Returns null when `up` is (numerically) parallel to `forward`, so no roll is defined.
 */
function uprightFor(forward: Vec, up: Vec): Vec | null {
    const n = len(up);
    if (n < EPS) return null;
    const u = scale(up, 1 / n);
    const rel = sub(u, scale(forward, dot(u, forward)));
    const m = len(rel);
    if (m < 1e-6) return null;
    return scale(rel, 1 / m);
}

// UNVERIFIED: the Babylon Lite construction call for a FreeCamera at a given pose.
// The library is not on this machine, so the factory name and arguments are a guess.
// Replace this with the real Lite constructor before use.
declare function createFreeCamera(eye: Vec, target: Vec): FreeCamera;

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const camera = createFreeCamera(eye, target);
    const forward = scale(sub(target, eye), 1 / len(sub(target, eye)));

    // Start upright: world up made perpendicular to the line of sight.
    // If the line of sight is vertical, fall back to the z axis.
    const start =
        uprightFor(forward, { x: 0, y: 1, z: 0 }) ??
        uprightFor(forward, { x: 0, y: 0, z: 1 }) ??
        { x: 0, y: 1, z: 0 };
    // UNVERIFIED: that camera.upVector drives the roll of the view matrix in Lite.
    (camera as unknown as { upVector: Vec }).upVector = start;

    return {
        camera,
        bank(up: Vec): void {
            const rolled = uprightFor(forward, up);
            // Degenerate call (car up along the line of sight): keep the previous roll.
            if (rolled === null) return;
            // UNVERIFIED: the look-at target is not reset here, so the roll is kept
            // without calling setTarget, which may discard it.
            (camera as unknown as { upVector: Vec }).upVector = rolled;
        },
    };
}
