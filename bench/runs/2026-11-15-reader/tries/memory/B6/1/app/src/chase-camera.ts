import { FreeCamera } from "@babylonjs/lite";

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

function add(a: Vec, b: Vec): Vec {
    return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function length(a: Vec): number {
    return Math.sqrt(dot(a, a));
}

function normalize(a: Vec): Vec {
    const len = length(a);
    return len > 0 ? scale(a, 1 / len) : { x: 0, y: 0, z: 0 };
}

/** Removes the component of v along the unit vector n. */
function removeAlong(v: Vec, n: Vec): Vec {
    return add(v, scale(n, -dot(v, n)));
}

/**
 * Returns the unit vector in the plane perpendicular to `forward` that is
 * closest to `up`, or null if `up` is (numerically) parallel to `forward`.
 */
function uprightFor(forward: Vec, up: Vec): Vec | null {
    const perp = removeAlong(up, forward);
    // Compare the residual to the input length so the test is scale-independent.
    const inLen = length(up);
    if (inLen === 0 || length(perp) <= EPS * inLen) {
        return null;
    }
    return normalize(perp);
}

/** Any unit vector perpendicular to `forward`, used only when there is no prior roll to keep. */
function fallbackUp(forward: Vec): Vec {
    const candidates: Vec[] = [
        { x: 0, y: 1, z: 0 },
        { x: 0, y: 0, z: 1 },
        { x: 1, y: 0, z: 0 },
    ];
    for (const c of candidates) {
        const u = uprightFor(forward, c);
        if (u) return u;
    }
    return { x: 0, y: 1, z: 0 };
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const position = { x: eye.x, y: eye.y, z: eye.z };
    const forward = normalize(sub(target, eye));

    // Start upright: world up projected onto the view plane.
    let currentUp = uprightFor(forward, { x: 0, y: 1, z: 0 }) ?? fallbackUp(forward);

    const camera = new FreeCamera("chaseCamera", position);
    applyOrientation(camera, position, target, currentUp);

    return {
        camera,
        bank(up: Vec): void {
            const fwd = normalize(sub(target, position));
            const next = uprightFor(fwd, up);
            if (next) {
                currentUp = next;
            } else {
                // Up is along the line of sight (or no up given): keep the previous roll,
                // re-projected onto the current view plane.
                currentUp = uprightFor(fwd, currentUp) ?? fallbackUp(fwd);
            }
            applyOrientation(camera, position, target, currentUp);
        },
    };
}

function applyOrientation(camera: FreeCamera, position: Vec, target: Vec, up: Vec): void {
    // Assumed Babylon-style API: a camera with a settable up vector used when building
    // the view matrix. The up vector is set after setTarget so the roll is not reset.
    // Not verified against Babylon Lite 1.39.0 (library not available here).
    camera.position = { x: position.x, y: position.y, z: position.z } as any;
    camera.setTarget(target as any);
    (camera as any).upVector = { x: up.x, y: up.y, z: up.z };
}
