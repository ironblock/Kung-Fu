// Chase camera that rolls with the car's up direction.
//
// NOTE: written without access to @babylonjs/lite 1.39.0 (not present on the
// build machine, and not compiled or run). The camera-facing lines marked
// UNVERIFIED below assume a factory and FreeCamera members that have not been
// checked against the library.
import type { FreeCamera } from "@babylonjs/lite";
// UNVERIFIED: factory name and signature.
import { createFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

// Below this length, a projected vector is treated as parallel to the line of sight.
const DEGENERATE_EPS = 1e-9;

function length(v: Vec): number {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

function scale(v: Vec, s: number): Vec {
    return { x: v.x * s, y: v.y * s, z: v.z * s };
}

function sub(a: Vec, b: Vec): Vec {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function dot(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

// Component of v perpendicular to the unit vector f (the picture plane).
function removeAlong(v: Vec, f: Vec): Vec {
    return sub(v, scale(f, dot(v, f)));
}

// Returns the unit "up" in the picture plane closest to the given direction,
// or undefined when that direction is parallel to the line of sight.
function uprightOf(dir: Vec, forward: Vec): Vec | undefined {
    const p = removeAlong(dir, forward);
    const pl = length(p);
    if (!(pl > DEGENERATE_EPS)) return undefined;
    return scale(p, 1 / pl);
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const toTarget = sub(target, eye);
    const dist = length(toTarget);
    if (!(dist > 0) || !Number.isFinite(dist)) {
        throw new Error("createChaseCamera: eye and target must differ");
    }
    const forward = scale(toTarget, 1 / dist);

    // Starts upright: world +Y, or +Z if the view is vertical.
    let roll: Vec =
        uprightOf({ x: 0, y: 1, z: 0 }, forward) ??
        uprightOf({ x: 0, y: 0, z: 1 }, forward)!;

    // UNVERIFIED: createFreeCamera(), position, upVector, setTarget().
    const camera = createFreeCamera();
    const apply = (): void => {
        camera.position.x = eye.x;
        camera.position.y = eye.y;
        camera.position.z = eye.z;
        camera.upVector.x = roll.x;
        camera.upVector.y = roll.y;
        camera.upVector.z = roll.z;
        camera.setTarget(target);
    };
    apply();

    return {
        camera,
        bank(up: Vec): void {
            const ul = length(up);
            if (ul > 0 && Number.isFinite(ul)) {
                const next = uprightOf(scale(up, 1 / ul), forward);
                // Parallel to the line of sight: keep the previous roll.
                if (next) roll = next;
            }
            // Re-assert the pose every call, including the degenerate case.
            apply();
        },
    };
}
