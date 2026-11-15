import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Below this length, the part of `up` perpendicular to the line of sight is
// treated as zero (up is parallel to the line of sight).
const DEGENERATE_EPSILON = 1e-6;

// Unit vector perpendicular to `dir` that is closest to `up`, or null when
// `up` is parallel to `dir`. `dir` must be a unit vector.
function uprightAgainst(up: Vec, dir: Vec): Vec | null {
    const d = up.x * dir.x + up.y * dir.y + up.z * dir.z;
    const x = up.x - d * dir.x;
    const y = up.y - d * dir.y;
    const z = up.z - d * dir.z;
    const len = Math.hypot(x, y, z);
    if (!(len > DEGENERATE_EPSILON)) {
        return null;
    }
    return { x: x / len, y: y / len, z: z / len };
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const dx = target.x - eye.x;
    const dy = target.y - eye.y;
    const dz = target.z - eye.z;
    const length = Math.hypot(dx, dy, dz);
    if (!(length > 0)) {
        throw new Error("createChaseCamera: eye and target must differ");
    }
    const dir: Vec = { x: dx / length, y: dy / length, z: dz / length };

    // Start upright: world +Y projected onto the picture plane. If the line of
    // sight is vertical, fall back to world +Z (it cannot be parallel to both).
    const start =
        uprightAgainst({ x: 0, y: 1, z: 0 }, dir) ??
        uprightAgainst({ x: 0, y: 0, z: 1 }, dir)!;

    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        start,
    );

    return {
        camera,
        bank(up: Vec): void {
            const next = uprightAgainst(up, dir);
            if (next === null) {
                // Up is exactly along the line of sight: keep the previous roll.
                return;
            }
            // Written in place, as the observable vector expects.
            const picture = camera.upVector;
            picture.x = next.x;
            picture.y = next.y;
            picture.z = next.z;
        },
    };
}
