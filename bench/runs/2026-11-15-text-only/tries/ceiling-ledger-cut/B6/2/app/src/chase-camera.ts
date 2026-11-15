import type { FreeCamera } from "@babylonjs/lite";
import { createBankedFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

/**
 * Below this length, the part of `up` that is perpendicular to the line of sight
 * counts as zero, i.e. `up` points along the line of sight (either way). `up` is a
 * unit vector, so this is the sine of the angle between it and the line of sight.
 */
const PARALLEL_EPSILON = 1e-6;

const WORLD_UP: Vec = { x: 0, y: 1, z: 0 };

function sub(a: Vec, b: Vec): Vec {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function dot(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function length(v: Vec): number {
    return Math.sqrt(dot(v, v));
}

/**
 * The unit vector closest to `up` that is perpendicular to the unit vector `forward`,
 * or null when `up` (nearly) lies along `forward`, where no such vector is defined.
 */
function upAcross(up: Vec, forward: Vec): Vec | null {
    const along = dot(up, forward);
    const p = {
        x: up.x - along * forward.x,
        y: up.y - along * forward.y,
        z: up.z - along * forward.z,
    };
    const len = length(p);
    const scale = length(up);
    if (!(len > PARALLEL_EPSILON * scale)) return null; // also catches NaN
    return { x: p.x / len, y: p.y / len, z: p.z / len };
}

/** Write components in place so the camera's observable vectors see the change. */
function assign(dst: Vec, src: Vec): void {
    dst.x = src.x;
    dst.y = src.y;
    dst.z = src.z;
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const camera = createBankedFreeCamera();
    assign(camera.position, eye);
    assign(camera.target, target);

    const lineOfSight = (): Vec | null => {
        const d = sub(camera.target, camera.position);
        const len = length(d);
        if (!(len > 0)) return null;
        return { x: d.x / len, y: d.y / len, z: d.z / len };
    };

    // Start upright: world up, made perpendicular to the line of sight. If the camera
    // looks straight up or down, world up is undefined as a roll, so fall back to +z.
    const forward0 = lineOfSight();
    const up0 =
        (forward0 && (upAcross(WORLD_UP, forward0) ?? upAcross({ x: 0, y: 0, z: 1 }, forward0))) ??
        WORLD_UP;
    assign(camera.upVector, up0);

    return {
        camera,
        bank(up: Vec): void {
            const forward = lineOfSight();
            if (!forward) return;
            const next = upAcross(up, forward);
            // Up along the line of sight: no roll is defined, so keep the previous one.
            // Position and target are untouched, so the camera keeps looking at the target.
            if (!next) return;
            assign(camera.upVector, next);
        },
    };
}
