import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

// Below this length, the requested up is considered parallel to the line of sight
// and the camera keeps its previous roll.
const PARALLEL_EPSILON = 1e-6;

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    // Unit line of sight from eye to target.
    const fx0 = target.x - eye.x;
    const fy0 = target.y - eye.y;
    const fz0 = target.z - eye.z;
    const fLen = Math.hypot(fx0, fy0, fz0);
    if (!(fLen > 0)) {
        throw new RangeError("createChaseCamera: eye and target must differ");
    }
    const fx = fx0 / fLen;
    const fy = fy0 / fLen;
    const fz = fz0 / fLen;

    // Project a world direction onto the image plane (perpendicular to the line of sight).
    // Returns the unit result, or null when the direction is parallel to the line of sight.
    const projectUp = (ux: number, uy: number, uz: number): Vec | null => {
        const d = ux * fx + uy * fy + uz * fz;
        const px = ux - d * fx;
        const py = uy - d * fy;
        const pz = uz - d * fz;
        const len = Math.hypot(px, py, pz);
        if (!(len > PARALLEL_EPSILON)) {
            return null;
        }
        return { x: px / len, y: py / len, z: pz / len };
    };

    // Start upright: world +Y, or +Z if the view is exactly vertical.
    const initialUp = projectUp(0, 1, 0) ?? projectUp(0, 0, 1);
    if (!initialUp) {
        // Unreachable: a unit forward cannot be parallel to both Y and Z.
        throw new RangeError("createChaseCamera: could not derive an initial up");
    }

    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        initialUp,
    );

    return {
        camera,
        bank(up: Vec): void {
            const roll = projectUp(up.x, up.y, up.z);
            if (roll === null) {
                // Up is along the line of sight: keep looking at the target and keep the previous roll.
                return;
            }
            camera.upVector.x = roll.x;
            camera.upVector.y = roll.y;
            camera.upVector.z = roll.z;
        },
    };
}
