import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

// Below this length, the wanted up is (nearly) along the line of sight and has no roll direction.
const DEGENERATE = 1e-6;

// Returns the component of `up` perpendicular to the unit `fwd`, normalised,
// or null when there is no usable direction.
function projectUp(up: Vec, fwd: Vec): Vec | null {
    const d = up.x * fwd.x + up.y * fwd.y + up.z * fwd.z;
    const x = up.x - d * fwd.x;
    const y = up.y - d * fwd.y;
    const z = up.z - d * fwd.z;
    const l = Math.hypot(x, y, z);
    if (!(l > DEGENERATE)) return null; // also catches NaN
    return { x: x / l, y: y / l, z: z / l };
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const dx = target.x - eye.x;
    const dy = target.y - eye.y;
    const dz = target.z - eye.z;
    const len = Math.hypot(dx, dy, dz);
    if (!(len > 0)) throw new Error("createChaseCamera: eye and target coincide");
    // The camera does not move, so the line of sight is fixed for its lifetime.
    const fwd: Vec = { x: dx / len, y: dy / len, z: dz / len };

    // "Upright" is world +Y projected onto the view plane; fall back to +Z when looking straight up/down.
    const initialUp =
        projectUp({ x: 0, y: 1, z: 0 }, fwd) ?? projectUp({ x: 0, y: 0, z: 1 }, fwd)!;

    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        initialUp,
    );

    return {
        camera,
        bank(up: Vec): void {
            const roll = projectUp(up, fwd);
            // Degenerate: keep the previous roll. Write in place so the observable vector notifies.
            if (roll === null) return;
            const uv = camera.upVector;
            uv.x = roll.x;
            uv.y = roll.y;
            uv.z = roll.z;
        },
    };
}
