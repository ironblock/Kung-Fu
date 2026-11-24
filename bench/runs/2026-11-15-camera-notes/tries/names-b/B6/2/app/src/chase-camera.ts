import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

// Below this length, the requested up is treated as lying along the line of sight.
const DEGENERATE_EPSILON = 1e-6;

function dot(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const dx = target.x - eye.x;
    const dy = target.y - eye.y;
    const dz = target.z - eye.z;
    const dist = Math.hypot(dx, dy, dz);
    if (!(dist > 0)) {
        throw new Error("createChaseCamera: eye and target must be distinct points");
    }
    // Unit line of sight, fixed for the life of the camera (eye and target do not move).
    const forward: Vec = { x: dx / dist, y: dy / dist, z: dz / dist };

    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: 0, y: 1, z: 0 },
    );

    // Roll the camera so its picture-up is the orthogonal projection of `up` onto the
    // image plane (perpendicular to the line of sight). That is the closest achievable
    // match to `up` for a fixed view direction. Returns false, leaving the roll
    // untouched, when `up` is (nearly) parallel to the line of sight.
    function applyUp(up: Vec): boolean {
        const along = dot(up, forward);
        const px = up.x - along * forward.x;
        const py = up.y - along * forward.y;
        const pz = up.z - along * forward.z;
        const len = Math.hypot(px, py, pz);
        if (!(len > DEGENERATE_EPSILON)) {
            return false;
        }
        camera.upVector.x = px / len;
        camera.upVector.y = py / len;
        camera.upVector.z = pz / len;
        return true;
    }

    // Start upright. If the line of sight is vertical, world Y gives no roll reference,
    // so fall back to world Z.
    if (!applyUp({ x: 0, y: 1, z: 0 })) {
        applyUp({ x: 0, y: 0, z: 1 });
    }

    return {
        camera,
        bank(up: Vec): void {
            // Degenerate input keeps the previous roll; the camera still looks at the target.
            applyUp(up);
        },
    };
}
