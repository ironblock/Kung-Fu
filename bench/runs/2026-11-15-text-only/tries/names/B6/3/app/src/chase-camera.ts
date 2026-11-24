import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

const EPS = 1e-6;
const WORLD_UP: Vec = { x: 0, y: 1, z: 0 };
const WORLD_Z: Vec = { x: 0, y: 0, z: 1 };

function sub(a: Vec, b: Vec): Vec {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

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

// Returns the unit vector closest to `u` that is perpendicular to the unit
// forward direction `f`, or null when `u` is (numerically) along the line of sight.
function uprightFor(f: Vec, u: Vec): Vec | null {
    const d = dot(u, f);
    const p = { x: u.x - d * f.x, y: u.y - d * f.y, z: u.z - d * f.z };
    const l = length(p);
    if (l < EPS) return null;
    return { x: p.x / l, y: p.y / l, z: p.z / l };
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const f0 = normalize(sub(target, eye));
    // Start upright: world up projected onto the view plane (Z as a fallback
    // when the camera looks straight up or down).
    const initialUp = uprightFor(f0, WORLD_UP) ?? uprightFor(f0, WORLD_Z)!;

    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: initialUp.x, y: initialUp.y, z: initialUp.z },
    );

    // The roll currently in effect; kept when a bank request is degenerate.
    let lastUp: Vec = initialUp;

    function bank(up: Vec): void {
        // Read the live position/target so the roll follows the camera's
        // current line of sight even if the caller has moved it.
        const f = normalize(sub(camera.target, camera.position));
        const u = normalize(up);

        const next =
            uprightFor(f, u) ??
            uprightFor(f, lastUp) ??
            uprightFor(f, WORLD_UP) ??
            uprightFor(f, WORLD_Z)!;

        camera.upVector.x = next.x;
        camera.upVector.y = next.y;
        camera.upVector.z = next.z;
        lastUp = next;
    }

    return { camera, bank };
}
