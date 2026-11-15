import type { FreeCamera } from "@babylonjs/lite";
import { createBankedFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Below this length, the up vector is treated as parallel to the line of sight.
const PARALLEL_EPSILON = 1e-9;

function normalizeOrNull(v: Vec): Vec | null {
    const len = Math.hypot(v.x, v.y, v.z);
    if (!(len > PARALLEL_EPSILON)) {
        return null;
    }
    return { x: v.x / len, y: v.y / len, z: v.z / len };
}

// Component of `up` perpendicular to the unit vector `forward`, normalized.
// This is the closest roll-correct picture-up for the given line of sight.
// Returns null when `up` is (numerically) along `forward`, so no roll is defined.
function uprightFor(forward: Vec, up: Vec): Vec | null {
    const d = up.x * forward.x + up.y * forward.y + up.z * forward.z;
    return normalizeOrNull({
        x: up.x - d * forward.x,
        y: up.y - d * forward.y,
        z: up.z - d * forward.z,
    });
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const forward = normalizeOrNull({
        x: target.x - eye.x,
        y: target.y - eye.y,
        z: target.z - eye.z,
    });
    if (!forward) {
        throw new Error("createChaseCamera: eye and target must be distinct");
    }

    // Start upright: world Y if the view is not vertical, otherwise world Z.
    const initialUp = uprightFor(forward, { x: 0, y: 1, z: 0 }) ?? uprightFor(forward, { x: 0, y: 0, z: 1 });
    // Cannot be null here: forward cannot be parallel to both Y and Z.
    const startUp = initialUp!;

    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: startUp.x, y: startUp.y, z: startUp.z },
    );

    return {
        camera,
        bank(up: Vec): void {
            const picture = uprightFor(forward, up);
            if (!picture) {
                // Up is along the line of sight: keep the previous roll.
                return;
            }
            camera.upVector.x = picture.x;
            camera.upVector.y = picture.y;
            camera.upVector.z = picture.z;
        },
    };
}
