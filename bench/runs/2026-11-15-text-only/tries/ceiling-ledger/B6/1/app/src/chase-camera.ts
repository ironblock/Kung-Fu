import { createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Below this length, the part of `up` that is perpendicular to the line of
// sight is treated as zero: `up` points along (or against) the view direction
// and gives no roll information.
const DEGENERATE = 1e-6;

function normalize(v: Vec): Vec | null {
    const len = Math.hypot(v.x, v.y, v.z);
    return len < DEGENERATE ? null : { x: v.x / len, y: v.y / len, z: v.z / len };
}

/** Component of `v` perpendicular to the unit vector `f`, normalized, or null if there is none. */
function perpendicularUnit(v: Vec, f: Vec): Vec | null {
    const d = v.x * f.x + v.y * f.y + v.z * f.z;
    return normalize({ x: v.x - d * f.x, y: v.y - d * f.y, z: v.z - d * f.z });
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    // ASSUMPTION (not verifiable here): createFreeCamera takes a name and a start position.
    const camera = createFreeCamera("chase", { x: eye.x, y: eye.y, z: eye.z });
    camera.position.set(eye.x, eye.y, eye.z);
    camera.target.set(target.x, target.y, target.z);

    const forward = normalize({ x: target.x - eye.x, y: target.y - eye.y, z: target.z - eye.z }) ?? { x: 0, y: 0, z: 1 };

    // Upright: world +Y made perpendicular to the line of sight. If we look
    // straight up or down, "upright" is undefined; fall back to world +Z.
    let currentUp: Vec = perpendicularUnit({ x: 0, y: 1, z: 0 }, forward) ?? perpendicularUnit({ x: 0, y: 0, z: 1 }, forward)!;

    const applyUp = (u: Vec): void => {
        // ASSUMPTION (not verifiable here): FreeCamera has an observable `up`
        // vector that feeds its look-at and bumps worldMatrixVersion when set,
        // the same way `position` and `target` do.
        camera.up.set(u.x, u.y, u.z);
    };
    applyUp(currentUp);

    return {
        camera,
        bank(up: Vec): void {
            // Closest roll to `up` that keeps looking at the target: drop the
            // part of `up` along the line of sight. position and target are
            // never touched, so the camera keeps looking at the target.
            const rolled = perpendicularUnit(up, forward);
            if (rolled === null) {
                // `up` is along the line of sight (either way): keep the previous roll.
                return;
            }
            currentUp = rolled;
            applyUp(currentUp);
        },
    };
}
