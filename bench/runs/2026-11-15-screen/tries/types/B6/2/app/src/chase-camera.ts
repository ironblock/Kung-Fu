import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

/** Below this length, the up vector is treated as parallel to the line of sight. */
const DEGENERATE_EPSILON = 1e-6;

const WORLD_UP: Vec = { x: 0, y: 1, z: 0 };
const WORLD_Z: Vec = { x: 0, y: 0, z: 1 };

function dot(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

/**
 * The part of `up` perpendicular to `forward`, normalized. This is the roll
 * that makes the camera's picture-up as close to `up` as possible while it
 * keeps looking along `forward`. Returns undefined when `up` is (numerically)
 * parallel to `forward`, so the roll is undefined.
 */
function perpendicularUp(up: Vec, forward: Vec): Vec | undefined {
    const d = dot(up, forward);
    const px = up.x - d * forward.x;
    const py = up.y - d * forward.y;
    const pz = up.z - d * forward.z;
    const m = Math.sqrt(px * px + py * py + pz * pz);
    if (!(m > DEGENERATE_EPSILON)) {
        return undefined; // also catches NaN
    }
    return { x: px / m, y: py / m, z: pz / m };
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const dx = target.x - eye.x;
    const dy = target.y - eye.y;
    const dz = target.z - eye.z;
    const dl = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (!(dl > 0)) {
        throw new Error("createChaseCamera: eye and target must be distinct points");
    }
    const forward: Vec = { x: dx / dl, y: dy / dl, z: dz / dl };

    // Start upright: world +Y projected onto the view plane. If the camera
    // looks straight up or down, use +Z instead (it cannot also be parallel).
    const initialUp = perpendicularUp(WORLD_UP, forward) ?? perpendicularUp(WORLD_Z, forward)!;

    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        initialUp,
    );

    return {
        camera,
        bank(up: Vec): void {
            const next = perpendicularUp(up, forward);
            if (!next) {
                // Up is along the line of sight: keep the previous roll.
                return;
            }
            const v = camera.upVector;
            v.x = next.x;
            v.y = next.y;
            v.z = next.z;
        },
    };
}
