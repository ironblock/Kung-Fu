import { createBankedFreeCamera } from "@babylonjs/lite";
import type { BankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

// Below this, the requested up is treated as lying along the line of sight.
// Measured as sin(angle) between the requested up and the forward direction.
const PARALLEL_EPSILON = 1e-6;

function dot(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function length(v: Vec): number {
    return Math.sqrt(dot(v, v));
}

// Component of `up` perpendicular to `forward` (unit), normalized.
// This is the closest direction to `up` that a camera looking along `forward`
// can have as its picture-up. Returns null when `up` is (numerically) parallel
// to `forward`, in which case no roll is defined.
function uprightFor(forward: Vec, up: Vec): Vec | null {
    const along = dot(up, forward);
    const p = {
        x: up.x - along * forward.x,
        y: up.y - along * forward.y,
        z: up.z - along * forward.z,
    };
    const len = length(p);
    if (len <= PARALLEL_EPSILON * Math.max(length(up), 1e-300)) return null;
    return { x: p.x / len, y: p.y / len, z: p.z / len };
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const d = { x: target.x - eye.x, y: target.y - eye.y, z: target.z - eye.z };
    const dLen = length(d);
    if (dLen === 0) throw new Error("createChaseCamera: eye and target coincide");
    const forward = { x: d.x / dLen, y: d.y / dLen, z: d.z / dLen };

    // "Starts upright": world +Y projected onto the view plane, falling back to
    // world +Z if the view direction is itself vertical.
    let roll =
        uprightFor(forward, { x: 0, y: 1, z: 0 }) ??
        uprightFor(forward, { x: 0, z: 1, y: 0 }) ??
        { x: 0, y: 1, z: 0 };

    const camera: BankedFreeCamera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: roll.x, y: roll.y, z: roll.z },
    );

    return {
        camera,
        bank(up: Vec): void {
            const next = uprightFor(forward, up);
            if (next) roll = next;
            // On a degenerate call `roll` is unchanged, so the previous roll is kept.
            camera.upVector.x = roll.x;
            camera.upVector.y = roll.y;
            camera.upVector.z = roll.z;
        },
    };
}
