import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Below this length, the up vector's component across the line of sight is
// treated as zero, i.e. the up is (numerically) along the line of sight.
const DEGENERATE_EPSILON = 1e-9;

function sub(a: Vec, b: Vec): Vec {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function dot(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function normalize(v: Vec): Vec | null {
    const len = Math.hypot(v.x, v.y, v.z);
    if (!(len > 0) || !Number.isFinite(len)) return null;
    return { x: v.x / len, y: v.y / len, z: v.z / len };
}

// The unit direction of `up` with its component along `forward` removed.
// This is the roll that puts the picture's up as close to `up` as possible
// while keeping the line of sight. Returns null when `up` is (nearly) parallel
// to `forward`, where no roll is defined.
function screenUp(forward: Vec, up: Vec): Vec | null {
    const u = normalize(up);
    if (!u) return null;
    const d = dot(u, forward);
    const p = {
        x: u.x - forward.x * d,
        y: u.y - forward.y * d,
        z: u.z - forward.z * d,
    };
    const len = Math.hypot(p.x, p.y, p.z);
    if (!(len > DEGENERATE_EPSILON)) return null;
    return { x: p.x / len, y: p.y / len, z: p.z / len };
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const forward = normalize(sub(target, eye));
    if (!forward) {
        throw new Error("createChaseCamera: eye and target must be distinct points");
    }

    // Start upright: world +Y as the picture's up, or +Z if the line of sight is vertical.
    const start =
        screenUp(forward, { x: 0, y: 1, z: 0 }) ??
        screenUp(forward, { x: 0, y: 0, z: 1 }) ??
        { x: 1, y: 0, z: 0 };

    const camera = createBankedFreeCamera(eye, target, start);

    return {
        camera,
        bank(up: Vec): void {
            const roll = screenUp(forward, up);
            // Up along the line of sight: keep the previous roll. The target is
            // fixed, so the view direction does not change and the last written
            // upVector is still valid.
            if (roll === null) return;
            camera.upVector.x = roll.x;
            camera.upVector.y = roll.y;
            camera.upVector.z = roll.z;
        },
    };
}
