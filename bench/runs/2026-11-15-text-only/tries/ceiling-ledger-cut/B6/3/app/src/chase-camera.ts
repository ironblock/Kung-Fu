import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Below this length the requested up has no usable part across the line of
// sight (it points along it, either way), so the roll is left as it was.
const DEGENERATE = 1e-6;

const dot = (a: Vec, b: Vec): number => a.x * b.x + a.y * b.y + a.z * b.z;
const len = (a: Vec): number => Math.sqrt(dot(a, a));

/**
 * The unit vector perpendicular to `forward` that is closest to `up`
 * (the part of `up` across the line of sight, normalised), or null when
 * `up` lies along the line of sight.
 */
function upAcross(forward: Vec, up: Vec): Vec | null {
    const d = dot(up, forward);
    const v = { x: up.x - d * forward.x, y: up.y - d * forward.y, z: up.z - d * forward.z };
    const l = len(v);
    if (!(l > DEGENERATE)) return null; // also rejects NaN input
    return { x: v.x / l, y: v.y / l, z: v.z / l };
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const dir = { x: target.x - eye.x, y: target.y - eye.y, z: target.z - eye.z };
    const dl = len(dir);
    if (!(dl > 0)) throw new Error("createChaseCamera: eye and target must differ");
    const forward = { x: dir.x / dl, y: dir.y / dl, z: dir.z / dl };

    // Upright: world +Y taken across the line of sight. If we look straight
    // up or down, +Y is useless, so fall back to +Z.
    const start = upAcross(forward, { x: 0, y: 1, z: 0 }) ?? upAcross(forward, { x: 0, y: 0, z: 1 })!;

    // One up object, owned here and mutated in place, so the camera always
    // sees the current roll through the same reference.
    const up: Vec = { ...start };

    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        up,
    ) as FreeCamera;

    return {
        camera,
        bank(carUp: Vec): void {
            const next = upAcross(forward, carUp);
            if (!next) return; // along the line of sight: keep the previous roll
            up.x = next.x;
            up.y = next.y;
            up.z = next.z;
        },
    };
}
