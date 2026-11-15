import type { FreeCamera } from "@babylonjs/lite";
import { createBankedFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Below this length, the wanted up direction is (numerically) along the line of sight.
const EPSILON = 1e-6;

function length(v: Vec): number {
    return Math.hypot(v.x, v.y, v.z);
}

function normalize(v: Vec): Vec {
    const l = length(v);
    return l > 0 ? { x: v.x / l, y: v.y / l, z: v.z / l } : { x: 0, y: 0, z: 0 };
}

// Part of v perpendicular to the unit vector f (not normalized).
function perpendicular(v: Vec, f: Vec): Vec {
    const d = v.x * f.x + v.y * f.y + v.z * f.z;
    return { x: v.x - d * f.x, y: v.y - d * f.y, z: v.z - d * f.z };
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const position = { x: eye.x, y: eye.y, z: eye.z };
    const lookAt = { x: target.x, y: target.y, z: target.z };

    // The eye and target never move, so the line of sight is fixed.
    const forward = normalize({
        x: lookAt.x - position.x,
        y: lookAt.y - position.y,
        z: lookAt.z - position.z,
    });

    // Start upright: world +Y projected onto the picture plane (+Z if the view is vertical).
    let upright = perpendicular({ x: 0, y: 1, z: 0 }, forward);
    if (length(upright) < EPSILON) {
        upright = perpendicular({ x: 0, y: 0, z: 1 }, forward);
    }
    let roll = normalize(upright);

    const camera = createBankedFreeCamera(position, lookAt, roll);

    return {
        camera,
        bank(up: Vec): void {
            // Closest achievable picture-up: the wanted up with its line-of-sight part removed.
            const wanted = perpendicular(up, forward);
            if (length(wanted) < EPSILON) {
                // Up is along the line of sight: keep the previous roll.
                return;
            }
            roll = normalize(wanted);
            // Write the components in place so the observable reports the change.
            camera.upVector.x = roll.x;
            camera.upVector.y = roll.y;
            camera.upVector.z = roll.z;
        },
    };
}
