import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Below this length, the car's up is treated as lying along the line of sight.
// Input is expected to be a unit vector, so this is a relative threshold.
const DEGENERATE_EPS = 1e-6;

function sub(a: Vec, b: Vec): Vec {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function dot(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function normalize(v: Vec): Vec | null {
    const len = Math.hypot(v.x, v.y, v.z);
    if (!(len > DEGENERATE_EPS)) return null;
    return { x: v.x / len, y: v.y / len, z: v.z / len };
}

// Returns the unit vector closest to `v` that is perpendicular to the unit
// line-of-sight `f`, i.e. the screen-up direction that `v` implies.
// Returns null when `v` is (nearly) parallel to `f`, where no roll is implied.
function screenUp(v: Vec, f: Vec): Vec | null {
    const d = dot(v, f);
    return normalize({ x: v.x - d * f.x, y: v.y - d * f.y, z: v.z - d * f.z });
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const f = normalize(sub(target, eye));
    if (!f) {
        throw new Error("createChaseCamera: eye and target must be distinct points");
    }

    // Start upright: world +Y projected onto the image plane. If the view is
    // exactly vertical, fall back to +Z so the start is still well defined.
    let lastUp: Vec =
        screenUp({ x: 0, y: 1, z: 0 }, f) ??
        screenUp({ x: 0, y: 0, z: 1 }, f)!;

    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: lastUp.x, y: lastUp.y, z: lastUp.z },
    );

    // Write the components in place so the library sees the change on the
    // observable vector.
    const applyUp = (u: Vec): void => {
        camera.upVector.x = u.x;
        camera.upVector.y = u.y;
        camera.upVector.z = u.z;
    };

    return {
        camera,
        bank(up: Vec): void {
            const next = screenUp(up, f);
            // Degenerate: the car's up is along the line of sight. Keep the
            // previous roll and the existing target lock.
            if (!next) return;
            lastUp = next;
            applyUp(lastUp);
        },
    };
}
