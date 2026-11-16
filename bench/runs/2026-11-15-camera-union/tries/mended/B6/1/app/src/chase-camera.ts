import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

// Below this length, the up vector is treated as parallel to the line of sight.
const DEGENERATE_EPSILON = 1e-9;

/**
 * Project `up` onto the plane perpendicular to the unit `forward` direction.
 * Returns null when `up` is (numerically) parallel to `forward`, in which case
 * no roll is defined.
 */
function projectUp(up: Vec, forward: Vec): Vec | null {
    const d = up.x * forward.x + up.y * forward.y + up.z * forward.z;
    const x = up.x - d * forward.x;
    const y = up.y - d * forward.y;
    const z = up.z - d * forward.z;
    const len = Math.hypot(x, y, z);
    if (!(len > DEGENERATE_EPSILON)) return null; // also rejects NaN
    return { x: x / len, y: y / len, z: z / len };
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const fx = target.x - eye.x;
    const fy = target.y - eye.y;
    const fz = target.z - eye.z;
    const fLen = Math.hypot(fx, fy, fz);
    if (!(fLen > 0)) {
        throw new RangeError("createChaseCamera: eye and target must differ");
    }
    const forward: Vec = { x: fx / fLen, y: fy / fLen, z: fz / fLen };

    // Start upright: world +Y rolled into the plane perpendicular to the view.
    const upright = projectUp({ x: 0, y: 1, z: 0 }, forward) ?? { x: 0, y: 1, z: 0 };

    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: upright.x, y: upright.y, z: upright.z },
    );

    return {
        camera,
        bank(up: Vec): void {
            const rolled = projectUp(up, forward);
            // Parallel to the line of sight: keep the previous roll.
            if (rolled === null) return;
            // Edit the components in place so the camera's observable upVector fires.
            camera.upVector.x = rolled.x;
            camera.upVector.y = rolled.y;
            camera.upVector.z = rolled.z;
        },
    };
}
