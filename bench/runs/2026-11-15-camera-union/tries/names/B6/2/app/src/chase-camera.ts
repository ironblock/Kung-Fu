import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

// Below this length, the car's up is treated as lying along the line of sight
// and the camera keeps its previous roll.
const EPS = 1e-9;

const WORLD_UP: Vec = { x: 0, y: 1, z: 0 };
const WORLD_Z: Vec = { x: 0, y: 0, z: 1 };

function sub(a: Vec, b: Vec): Vec {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function dot(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function length(v: Vec): number {
    return Math.sqrt(dot(v, v));
}

function scale(v: Vec, s: number): Vec {
    return { x: v.x * s, y: v.y * s, z: v.z * s };
}

function normalize(v: Vec): Vec {
    const l = length(v);
    return scale(v, 1 / l);
}

// Component of `v` perpendicular to the unit vector `forward`.
// Its length is sin(angle between v and forward), so it is ~0 when v is along the line of sight.
function residual(v: Vec, forward: Vec): Vec {
    return sub(v, scale(forward, dot(v, forward)));
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const span = sub(target, eye);
    if (length(span) === 0) {
        throw new Error("createChaseCamera: eye and target coincide");
    }
    const forward = normalize(span);

    // Starting roll: upright, i.e. world up projected onto the image plane.
    let startUp = residual(WORLD_UP, forward);
    if (length(startUp) < EPS) {
        // Looking straight up or down: fall back to world Z.
        startUp = residual(WORLD_Z, forward);
    }
    startUp = normalize(startUp);

    const camera = createBankedFreeCamera(eye, target, startUp);

    function bank(up: Vec): void {
        const upLength = length(up);
        if (upLength === 0) {
            return; // no usable direction; keep previous roll
        }
        const r = residual(scale(up, 1 / upLength), forward);
        const rLength = length(r);
        if (rLength < EPS) {
            // Car's up is along the line of sight: keep looking at the target, keep previous roll.
            return;
        }
        const n = scale(r, 1 / rLength);
        camera.upVector.x = n.x;
        camera.upVector.y = n.y;
        camera.upVector.z = n.z;
    }

    return { camera, bank };
}
