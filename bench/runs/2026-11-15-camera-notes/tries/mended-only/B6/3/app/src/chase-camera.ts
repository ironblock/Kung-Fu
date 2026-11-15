import { createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

// Below this sine of the angle between the car's up and the line of sight,
// the up direction is treated as parallel to the view and the roll is kept.
const PARALLEL_EPS = 1e-6;

function sub(a: Vec, b: Vec): Vec {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function scale(a: Vec, k: number): Vec {
    return { x: a.x * k, y: a.y * k, z: a.z * k };
}

function dot(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function len(a: Vec): number {
    return Math.hypot(a.x, a.y, a.z);
}

function normalize(a: Vec): Vec {
    return scale(a, 1 / len(a));
}

// Component of v perpendicular to the unit vector f.
function perpendicularTo(v: Vec, f: Vec): Vec {
    return sub(v, scale(f, dot(v, f)));
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const forward = normalize(sub(target, eye));

    // Starting roll is upright: world +Y projected onto the image plane.
    // If the view is exactly vertical, fall back to world +Z.
    let roll = perpendicularTo({ x: 0, y: 1, z: 0 }, forward);
    if (len(roll) < PARALLEL_EPS) {
        roll = perpendicularTo({ x: 0, y: 0, z: 1 }, forward);
    }
    roll = normalize(roll);

    // ASSUMPTION, not verified: the Babylon Lite 1.39.0 library is not on this machine.
    // This assumes createFreeCamera(position, target) and that FreeCamera exposes an
    // `upVector` which its view matrix uses for roll.
    const camera = createFreeCamera({ ...eye }, { ...target });
    camera.upVector = { ...roll };

    return {
        camera,
        bank(up: Vec): void {
            // Closest achievable screen-up: the car's up with its forward part removed.
            const s = perpendicularTo(up, forward);
            const sLen = len(s);
            // Up (anti)parallel to the line of sight: no roll direction exists, keep the previous one.
            if (sLen / len(up) >= PARALLEL_EPS) {
                roll = scale(s, 1 / sLen);
                camera.upVector = { ...roll };
            }
        },
    };
}
