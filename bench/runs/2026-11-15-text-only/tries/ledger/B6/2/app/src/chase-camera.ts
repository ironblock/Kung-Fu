import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

// Below this length a vector is treated as zero. Unit inputs that point exactly along the
// line of sight leave a residual of around 1e-16, far under this bound.
const EPS = 1e-9;
const WORLD_UP: Vec = { x: 0, y: 1, z: 0 };
const WORLD_Z: Vec = { x: 0, y: 0, z: 1 };

function sub(a: Vec, b: Vec): Vec {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function dot(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function scale(a: Vec, s: number): Vec {
    return { x: a.x * s, y: a.y * s, z: a.z * s };
}

function normalize(a: Vec): Vec | null {
    const l = Math.hypot(a.x, a.y, a.z);
    return l < EPS ? null : scale(a, 1 / l);
}

// The part of `up` perpendicular to `forward`, normalized. This is the roll that puts the
// picture's up as close to `up` as possible while still looking along `forward`.
// Returns null when `up` is (nearly) parallel to `forward`, so no roll is defined.
function rollUp(forward: Vec, up: Vec): Vec | null {
    const u = normalize(up);
    if (u === null) return null;
    return normalize(sub(u, scale(forward, dot(u, forward))));
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const forward = normalize(sub(target, eye));
    if (forward === null) {
        throw new Error("createChaseCamera: eye and target must differ");
    }

    // Start upright: world up projected perpendicular to the view direction. If the view is
    // vertical, fall back to world Z, which cannot also be parallel to the view direction.
    const startUp = rollUp(forward, WORLD_UP) ?? rollUp(forward, WORLD_Z);

    const camera = createBankedFreeCamera({
        position: { x: eye.x, y: eye.y, z: eye.z },
        target: { x: target.x, y: target.y, z: target.z },
        upVector: startUp ?? { x: 0, y: 1, z: 0 },
    });

    function bank(up: Vec): void {
        // Read the live pose so the roll stays correct even if the camera was moved elsewhere.
        const dir = normalize(sub(camera.target, camera.position));
        if (dir === null) return;
        const rolled = rollUp(dir, up);
        if (rolled === null) return; // up runs along the line of sight: keep the previous roll
        camera.upVector = rolled;
    }

    return { camera, bank };
}
