import { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

const EPS = 1e-9;

function sub(a: Vec, b: Vec): Vec {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function dot(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

// Returns a unit vector, or null when the input is zero, non-finite, or too short to normalize.
function normalize(a: Vec): Vec | null {
    const len = Math.hypot(a.x, a.y, a.z);
    if (!(len > EPS) || !Number.isFinite(len)) return null;
    return { x: a.x / len, y: a.y / len, z: a.z / len };
}

// Projects v onto the plane perpendicular to the unit vector `forward` and normalizes the result.
// This is the closest direction to v that can appear as "up" in the picture.
// Returns null when v is (nearly) parallel to forward, i.e. the roll is undefined.
function uprightOnPlane(v: Vec, forward: Vec): Vec | null {
    const d = dot(v, forward);
    return normalize({
        x: v.x - d * forward.x,
        y: v.y - d * forward.y,
        z: v.z - d * forward.z,
    });
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const forward = normalize(sub(target, eye));
    if (!forward) throw new Error("createChaseCamera: eye and target must be distinct");

    // Starts upright: world up projected onto the view plane. If the view is exactly
    // vertical, fall back to world Z.
    let roll: Vec =
        uprightOnPlane({ x: 0, y: 1, z: 0 }, forward) ??
        uprightOnPlane({ x: 0, y: 0, z: 1 }, forward)!;

    const camera = new FreeCamera("chaseCamera", { x: eye.x, y: eye.y, z: eye.z });
    camera.upVector = { x: roll.x, y: roll.y, z: roll.z };
    camera.setTarget({ x: target.x, y: target.y, z: target.z });

    return {
        camera,
        bank(up: Vec): void {
            // Degenerate case (up parallel to the line of sight, or non-finite input):
            // keep the previous roll, but still look at the target.
            const next = uprightOnPlane(up, forward);
            if (next) roll = next;
            camera.upVector = { x: roll.x, y: roll.y, z: roll.z };
            camera.setTarget({ x: target.x, y: target.y, z: target.z });
        },
    };
}
