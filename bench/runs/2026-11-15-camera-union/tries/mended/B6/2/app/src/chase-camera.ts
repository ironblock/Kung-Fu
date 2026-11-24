import { createBankedFreeCamera, type FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Below this length, the requested up is treated as parallel to the line of sight.
const DEGENERATE_EPSILON = 1e-6;

function normalize(v: Vec): Vec {
    const len = Math.hypot(v.x, v.y, v.z);
    return { x: v.x / len, y: v.y / len, z: v.z / len };
}

/**
 * Returns the component of `up` perpendicular to the unit vector `forward`,
 * normalized, or null if `up` is (numerically) parallel to `forward`.
 */
function perpendicularUp(up: Vec, forward: Vec): Vec | null {
    const d = up.x * forward.x + up.y * forward.y + up.z * forward.z;
    const px = up.x - d * forward.x;
    const py = up.y - d * forward.y;
    const pz = up.z - d * forward.z;
    const len = Math.hypot(px, py, pz);
    if (len < DEGENERATE_EPSILON) {
        return null;
    }
    return { x: px / len, y: py / len, z: pz / len };
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const forward = normalize({
        x: target.x - eye.x,
        y: target.y - eye.y,
        z: target.z - eye.z,
    });

    // Start upright: world +Y projected onto the view plane. If the view is
    // vertical, fall back to +Z so the initial roll is still defined.
    const worldUp = perpendicularUp({ x: 0, y: 1, z: 0 }, forward)
        ?? perpendicularUp({ x: 0, y: 0, z: 1 }, forward)
        ?? { x: 0, y: 1, z: 0 };

    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        worldUp,
    );

    return {
        camera,
        bank(up: Vec): void {
            const roll = perpendicularUp(normalize(up), forward);
            if (roll === null) {
                // Up is along the line of sight: keep the previous roll.
                return;
            }
            // Write in place: upVector is readonly and the camera rolls on write.
            const uv = camera.upVector;
            uv.x = roll.x;
            uv.y = roll.y;
            uv.z = roll.z;
        },
    };
}
