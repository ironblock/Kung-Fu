import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

/** Below this length the part of `up` across the line of sight is treated as zero, i.e. `up`
 *  points along (or against) the view direction and gives no usable roll. */
const DEGENERATE = 1e-6;

/** Unit vector of `v` with its component along unit `dir` removed, or null if nothing is left. */
function perpendicularUnit(v: Vec, dir: Vec): Vec | null {
    const d = v.x * dir.x + v.y * dir.y + v.z * dir.z;
    const x = v.x - d * dir.x;
    const y = v.y - d * dir.y;
    const z = v.z - d * dir.z;
    const len = Math.hypot(x, y, z);
    return len < DEGENERATE ? null : { x: x / len, y: y / len, z: z / len };
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const dx = target.x - eye.x;
    const dy = target.y - eye.y;
    const dz = target.z - eye.z;
    const len = Math.hypot(dx, dy, dz);
    if (!(len > 0)) {
        throw new Error("createChaseCamera: eye and target must be different points");
    }
    const forward = { x: dx / len, y: dy / len, z: dz / len };

    // Upright = world +Y. If the camera looks straight up or down, +Y gives no roll, so use +Z instead.
    const initialUp = perpendicularUnit({ x: 0, y: 1, z: 0 }, forward) ?? perpendicularUnit({ x: 0, y: 0, z: 1 }, forward)!;
    const camera = createBankedFreeCamera(eye, target, initialUp);

    return {
        camera,
        bank(up: Vec): void {
            // Use the camera's current line of sight, in case position/target were moved since creation.
            const p = camera.position;
            const t = camera.target;
            const fx = t.x - p.x;
            const fy = t.y - p.y;
            const fz = t.z - p.z;
            const fLen = Math.hypot(fx, fy, fz);
            if (!(fLen > 0)) {
                return;
            }
            // Closest up the camera can show while still looking at the target: `up` projected onto the
            // picture plane. If `up` lies along the line of sight (either way), keep the previous roll.
            const screenUp = perpendicularUnit(up, { x: fx / fLen, y: fy / fLen, z: fz / fLen });
            if (screenUp) {
                camera.upVector.set(screenUp.x, screenUp.y, screenUp.z);
            }
        },
    };
}
