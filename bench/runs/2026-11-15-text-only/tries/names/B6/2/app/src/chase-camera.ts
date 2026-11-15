import { createBankedFreeCamera } from "@babylonjs/lite";
import type { BankedFreeCamera, FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

// Relative tolerance: a desired up whose component across the line of sight is
// smaller than this fraction of its length is treated as parallel to the view direction.
const PARALLEL_EPS = 1e-6;

function dot(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function length(a: Vec): number {
    return Math.sqrt(dot(a, a));
}

function normalize(a: Vec): Vec {
    const l = length(a);
    return { x: a.x / l, y: a.y / l, z: a.z / l };
}

// Projects `up` onto the plane perpendicular to the unit forward vector `f`
// and normalizes the result. Returns null when `up` is (nearly) parallel to `f`,
// because then no roll can bring up into the picture.
function uprightFor(up: Vec, f: Vec): Vec | null {
    const lu = length(up);
    if (lu === 0) return null;
    const d = dot(up, f);
    const p = { x: up.x - d * f.x, y: up.y - d * f.y, z: up.z - d * f.z };
    const lp = length(p);
    if (lp <= PARALLEL_EPS * lu) return null;
    return { x: p.x / lp, y: p.y / lp, z: p.z / lp };
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const toTarget = { x: target.x - eye.x, y: target.y - eye.y, z: target.z - eye.z };
    if (length(toTarget) === 0) {
        throw new Error("createChaseCamera: eye and target must be different points");
    }
    const f = normalize(toTarget);

    // Starts upright: world +Y projected across the line of sight.
    // If the view is exactly vertical, fall back to world +Z (always non-parallel then).
    const initialUp =
        uprightFor({ x: 0, y: 1, z: 0 }, f) ?? uprightFor({ x: 0, y: 0, z: 1 }, f) as Vec;

    const camera: BankedFreeCamera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: initialUp.x, y: initialUp.y, z: initialUp.z },
    );

    let up: Vec = initialUp;

    return {
        camera,
        bank(input: Vec): void {
            const next = uprightFor(input, f);
            // Up points along the line of sight: keep the previous roll and target.
            if (next === null) return;
            up = next;
            camera.upVector.x = up.x;
            camera.upVector.y = up.y;
            camera.upVector.z = up.z;
        },
    };
}
