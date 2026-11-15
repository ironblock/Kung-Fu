import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Below this length, the desired up is treated as lying along the line of sight.
// The projected up has length sin(angle), so this is roughly a 1e-6 rad threshold.
const PARALLEL_EPSILON = 1e-6;

const WORLD_UP: Vec = { x: 0, y: 1, z: 0 };
// Only used if the eye->target line is exactly vertical at creation, where
// world up gives no upright direction.
const FALLBACK_UP: Vec = { x: 0, y: 0, z: 1 };

function dot(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function sub(a: Vec, b: Vec): Vec {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function forwardOf(eye: Vec, target: Vec): Vec {
    const d = sub(target, eye);
    const len = Math.sqrt(dot(d, d));
    if (!(len > 0)) {
        throw new Error("chase camera: eye and target must not coincide");
    }
    return { x: d.x / len, y: d.y / len, z: d.z / len };
}

// The component of `up` perpendicular to the unit vector `forward`, normalized.
// Returns null when `up` is (nearly) along `forward`, so there is no roll to pick.
function uprightFor(forward: Vec, up: Vec): Vec | null {
    const d = dot(up, forward);
    const w = {
        x: up.x - d * forward.x,
        y: up.y - d * forward.y,
        z: up.z - d * forward.z,
    };
    const len = Math.sqrt(dot(w, w));
    if (!(len > PARALLEL_EPSILON)) {
        return null;
    }
    return { x: w.x / len, y: w.y / len, z: w.z / len };
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const forward0 = forwardOf(eye, target);
    // Starts upright: world up projected onto the image plane.
    let roll: Vec = uprightFor(forward0, WORLD_UP) ?? uprightFor(forward0, FALLBACK_UP) ?? FALLBACK_UP;

    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: roll.x, y: roll.y, z: roll.z },
    );

    function bank(up: Vec): void {
        const forward = forwardOf(camera.position, camera.target);
        const next = uprightFor(forward, up);
        if (next === null) {
            // Up is along the line of sight: keep the previous roll, re-projected
            // onto the current forward direction in case the aim has moved.
            const kept = uprightFor(forward, roll);
            if (kept === null) {
                return;
            }
            roll = kept;
        } else {
            roll = next;
        }
        camera.upVector.x = roll.x;
        camera.upVector.y = roll.y;
        camera.upVector.z = roll.z;
    }

    return { camera, bank };
}
