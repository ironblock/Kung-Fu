import { createBankedFreeCamera } from "@babylonjs/lite";
import type { BankedFreeCamera, FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Below this length, the desired up is treated as parallel to the line of sight.
const PARALLEL_EPSILON = 1e-6;

const WORLD_UP: Vec = { x: 0, y: 1, z: 0 };
const WORLD_Z: Vec = { x: 0, y: 0, z: 1 };

function sub(a: Vec, b: Vec): Vec {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function length(v: Vec): number {
    return Math.hypot(v.x, v.y, v.z);
}

// Returns the unit vector closest to `v` that is perpendicular to the unit
// forward direction `f`, i.e. the picture-up that best matches `v` for a camera
// looking along `f`. Returns null when `v` is (numerically) parallel to `f`,
// or zero, so there is no well-defined roll.
function uprightFor(v: Vec, f: Vec): Vec | null {
    const vl = length(v);
    if (vl === 0) return null;
    const ux = v.x / vl, uy = v.y / vl, uz = v.z / vl;
    const d = ux * f.x + uy * f.y + uz * f.z;
    const px = ux - d * f.x;
    const py = uy - d * f.y;
    const pz = uz - d * f.z;
    const pl = Math.hypot(px, py, pz);
    if (pl < PARALLEL_EPSILON) return null;
    return { x: px / pl, y: py / pl, z: pz / pl };
}

function setUp(camera: BankedFreeCamera, up: Vec): void {
    camera.upVector.x = up.x;
    camera.upVector.y = up.y;
    camera.upVector.z = up.z;
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const span = sub(target, eye);
    const spanLength = length(span);
    if (spanLength === 0) {
        throw new Error("createChaseCamera: eye and target must differ");
    }
    const forward: Vec = {
        x: span.x / spanLength,
        y: span.y / spanLength,
        z: span.z / spanLength,
    };

    // Start upright: world up projected onto the view plane. If the view is
    // exactly vertical, fall back to world Z, which cannot also be parallel.
    const initialUp = uprightFor(WORLD_UP, forward) ?? uprightFor(WORLD_Z, forward)!;

    const camera = createBankedFreeCamera(eye, target, initialUp);
    setUp(camera, initialUp);

    let currentUp: Vec = initialUp;

    return {
        camera,
        bank(up: Vec): void {
            const next = uprightFor(up, forward);
            if (next === null) {
                // Up is along the line of sight: keep looking at the target and
                // keep the previous roll.
                return;
            }
            currentUp = next;
            setUp(camera, currentUp);
        },
    };
}
