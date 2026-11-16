import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Below this length, a projected vector is treated as zero (up is parallel to the line of sight).
const PARALLEL_EPSILON = 1e-9;

function dot(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function length(v: Vec): number {
    return Math.hypot(v.x, v.y, v.z);
}

function normalize(v: Vec): Vec {
    const l = length(v);
    return { x: v.x / l, y: v.y / l, z: v.z / l };
}

// Component of v perpendicular to the unit vector f.
function perpendicularTo(v: Vec, f: Vec): Vec {
    const d = dot(v, f);
    return { x: v.x - d * f.x, y: v.y - d * f.y, z: v.z - d * f.z };
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const line = { x: target.x - eye.x, y: target.y - eye.y, z: target.z - eye.z };
    if (!(length(line) > 0)) {
        throw new Error("createChaseCamera: eye and target must be different points");
    }
    const forward = normalize(line);

    // Start upright: world Y made perpendicular to the line of sight.
    // If the line of sight is vertical, world Y is useless, so fall back to world Z.
    let upRef = perpendicularTo({ x: 0, y: 1, z: 0 }, forward);
    if (length(upRef) < PARALLEL_EPSILON) {
        upRef = perpendicularTo({ x: 0, y: 0, z: 1 }, forward);
    }
    // The camera's current roll: always a unit vector perpendicular to forward.
    let currentUp = normalize(upRef);

    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: currentUp.x, y: currentUp.y, z: currentUp.z },
    );

    // upVector is readonly on the camera, so its components are written in place.
    const writeUp = (u: Vec) => {
        camera.upVector.x = u.x;
        camera.upVector.y = u.y;
        camera.upVector.z = u.z;
    };

    return {
        camera,
        bank(up: Vec): void {
            // Closest achievable camera up to the requested direction: its component
            // perpendicular to the line of sight. Only the roll changes; the look direction
            // (eye -> target) is untouched.
            const projected = perpendicularTo(up, forward);
            if (length(projected) < PARALLEL_EPSILON) {
                // Up points along the line of sight: no roll is defined, keep the previous one.
                return;
            }
            currentUp = normalize(projected);
            writeUp(currentUp);
        },
    };
}
