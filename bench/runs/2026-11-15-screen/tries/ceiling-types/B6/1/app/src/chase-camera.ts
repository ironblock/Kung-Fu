import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

const WORLD_UP: Vec = { x: 0, y: 1, z: 0 };
const WORLD_FORWARD: Vec = { x: 0, y: 0, z: 1 };

/**
 * How close to the line of sight (as the sine of the angle between them) a requested up may be
 * before it counts as lying along it. Such an up gives no sideways direction to roll toward. Also,
 * if Babylon Lite gets an up parallel to the view direction, it falls back to an identity rotation
 * and the camera no longer looks at its target.
 */
const ALONG_SIGHT_EPSILON = 1e-6;

/**
 * Writes into `out` the unit vector closest to `up` that is perpendicular to the line of sight
 * from `eye` to `target`. That is the up the picture can actually show while still looking at
 * `target`. Returns false and leaves `out` untouched if there is no such vector, because eye and
 * target are the same point or `up` lies along the line of sight (or `up` is zero).
 */
function screenUp(eye: Vec, target: Vec, up: Vec, out: Vec): boolean {
    let fx = target.x - eye.x;
    let fy = target.y - eye.y;
    let fz = target.z - eye.z;
    const forwardLength = Math.hypot(fx, fy, fz);
    if (!(forwardLength > 0)) return false;
    fx /= forwardLength;
    fy /= forwardLength;
    fz /= forwardLength;

    // Remove the part of `up` that lies along the line of sight.
    const along = up.x * fx + up.y * fy + up.z * fz;
    const ux = up.x - along * fx;
    const uy = up.y - along * fy;
    const uz = up.z - along * fz;
    const sideways = Math.hypot(ux, uy, uz);
    if (!(sideways > ALONG_SIGHT_EPSILON * Math.hypot(up.x, up.y, up.z))) return false;

    out.x = ux / sideways;
    out.y = uy / sideways;
    out.z = uz / sideways;
    return true;
}

/**
 * Creates a camera at `eye`, looking at `target`, that starts upright (world +Y up). Call
 * `bank(up)` with the car's up direction to roll the camera so that up in the picture matches it
 * as closely as possible while the camera keeps looking at its target. If `up` points along the
 * line of sight, toward or away from the target, the call keeps the previous roll.
 *
 * `bank` uses the camera's current position and target, so it still works if the caller moves
 * `camera.position` / `camera.target` to follow the car.
 */
export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const initialUp: Vec = { x: WORLD_UP.x, y: WORLD_UP.y, z: WORLD_UP.z };
    // If the camera starts looking straight up or down, world +Y lies along the line of sight and
    // gives no roll. Use +Z as the top of the picture so the camera still looks at the target.
    if (!screenUp(eye, target, WORLD_UP, initialUp)) {
        screenUp(eye, target, WORLD_FORWARD, initialUp);
    }

    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        initialUp,
    );

    return {
        camera,
        bank(up: Vec): void {
            // When there is no usable up, screenUp leaves upVector alone, so the previous roll stays.
            screenUp(camera.position, camera.target, up, camera.upVector);
        },
    };
}
