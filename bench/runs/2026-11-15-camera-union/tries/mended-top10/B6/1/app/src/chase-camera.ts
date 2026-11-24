import type { FreeCamera } from "@babylonjs/lite";
import { createBankedFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Below this length, the wanted up direction is (nearly) along the line of sight
// and has no usable roll, so the previous roll is kept.
const DEGENERATE_EPSILON = 1e-6;

function dot(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function normalize(v: Vec): Vec {
    const len = Math.hypot(v.x, v.y, v.z);
    return { x: v.x / len, y: v.y / len, z: v.z / len };
}

/**
 * Returns the unit vector closest to `up` that is perpendicular to the forward
 * direction `fwd` (a unit vector), or null when `up` is along `fwd`.
 */
function rollUpFor(fwd: Vec, up: Vec): Vec | null {
    const d = dot(up, fwd);
    const p = {
        x: up.x - d * fwd.x,
        y: up.y - d * fwd.y,
        z: up.z - d * fwd.z,
    };
    const len = Math.hypot(p.x, p.y, p.z);
    if (len < DEGENERATE_EPSILON) {
        return null;
    }
    return { x: p.x / len, y: p.y / len, z: p.z / len };
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    // The eye and target never move, so the view direction is fixed.
    const fwd = normalize({
        x: target.x - eye.x,
        y: target.y - eye.y,
        z: target.z - eye.z,
    });

    // Start upright: world up, or a fallback axis if the view is vertical.
    const start =
        rollUpFor(fwd, { x: 0, y: 1, z: 0 }) ??
        rollUpFor(fwd, { x: 0, y: 0, z: 1 }) ??
        { x: 0, y: 1, z: 0 };

    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        start,
    );

    return {
        camera,
        bank(up: Vec): void {
            const roll = rollUpFor(fwd, up);
            if (roll === null) {
                // Up is along the line of sight: keep the previous roll.
                return;
            }
            // Edit in place so the observable reports the change.
            const upVector = camera.upVector;
            upVector.x = roll.x;
            upVector.y = roll.y;
            upVector.z = roll.z;
        },
    };
}
