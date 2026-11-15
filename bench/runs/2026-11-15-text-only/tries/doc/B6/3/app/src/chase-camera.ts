import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

/**
 * Below this magnitude of cross(up, viewDir) the up vector is considered parallel
 * to the line of sight and the roll is left unchanged.
 */
const DEGENERATE_EPSILON = 1e-6;

/**
 * Creates a camera at `eye` looking at `target`, starting upright (world +Y up).
 * `bank(up)` rolls the camera so its picture-up matches `up` as closely as possible
 * while still looking at `target`.
 */
export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const camera = createBankedFreeCamera(eye, target);

    // Fixed view direction: the camera never moves, only rolls.
    const fx = target.x - eye.x;
    const fy = target.y - eye.y;
    const fz = target.z - eye.z;
    const fl = Math.hypot(fx, fy, fz);
    const view = fl > 0 ? { x: fx / fl, y: fy / fl, z: fz / fl } : null;

    return {
        camera,
        bank(up: Vec): void {
            if (view === null) return;

            const ul = Math.hypot(up.x, up.y, up.z);
            if (!(ul > 0) || !Number.isFinite(ul)) return;
            const ux = up.x / ul;
            const uy = up.y / ul;
            const uz = up.z / ul;

            // |cross(up, view)| = sin(angle between them). Near zero means the up
            // vector points along the line of sight, so keep the previous roll.
            const cx = uy * view.z - uz * view.y;
            const cy = uz * view.x - ux * view.z;
            const cz = ux * view.y - uy * view.x;
            if (Math.hypot(cx, cy, cz) < DEGENERATE_EPSILON) return;

            // The look-at basis takes x = normalize(cross(up, z)) and y = cross(z, x),
            // which is the component of `up` perpendicular to the view direction.
            // Handing it the normalized up therefore gives the closest achievable roll.
            camera.upVector.x = ux;
            camera.upVector.y = uy;
            camera.upVector.z = uz;
        },
    };
}
