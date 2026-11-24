import { createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

// Below this sine of the angle between the car's up and the line of sight, the
// roll is undefined and the previous roll is kept.
const DEGENERATE_EPS = 1e-6;

function dot(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function sub(a: Vec, b: Vec): Vec {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function scale(a: Vec, s: number): Vec {
    return { x: a.x * s, y: a.y * s, z: a.z * s };
}

function length(a: Vec): number {
    return Math.sqrt(dot(a, a));
}

function normalize(a: Vec): Vec {
    return scale(a, 1 / length(a));
}

// The unit vector in the plane perpendicular to `forward` that is closest to `up`,
// or undefined when `up` is (numerically) along `forward`.
function uprightAgainst(up: Vec, forward: Vec): Vec | undefined {
    const w = sub(up, scale(forward, dot(up, forward)));
    if (length(w) < DEGENERATE_EPS) return undefined;
    return normalize(w);
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const offset = sub(target, eye);
    if (length(offset) === 0) {
        throw new RangeError("createChaseCamera: eye and target must differ");
    }
    const forward = normalize(offset);

    const camera = createFreeCamera({
        position: { x: eye.x, y: eye.y, z: eye.z },
        target: { x: target.x, y: target.y, z: target.z },
    });

    // Start upright: world up if the line of sight allows it, otherwise world Z.
    let roll: Vec =
        uprightAgainst({ x: 0, y: 1, z: 0 }, forward) ??
        uprightAgainst({ x: 0, y: 0, z: 1 }, forward)!;
    camera.upVector.x = roll.x;
    camera.upVector.y = roll.y;
    camera.upVector.z = roll.z;

    function bank(up: Vec): void {
        const next = uprightAgainst(up, forward);
        if (next === undefined) return; // up is along the line of sight: keep previous roll
        roll = next;
        camera.upVector.x = roll.x;
        camera.upVector.y = roll.y;
        camera.upVector.z = roll.z;
    }

    return { camera, bank };
}
