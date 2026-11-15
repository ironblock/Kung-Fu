import { createBankedFreeCamera, type FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

/** Below this sine of the angle between the car's up and the line of sight, the roll is undefined.
 *  Stricter than the library's own identity-fallback threshold (1e-10), so a bank call never reaches
 *  the library's identity fallback, which would also drop the look-at. */
const DEGENERATE_SINE = 1e-9;

function sub(a: Vec, b: Vec): Vec {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function cross(a: Vec, b: Vec): Vec {
    return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x };
}

function length(a: Vec): number {
    return Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
}

/** Returns a unit copy of `a`, or null when `a` has no usable direction (zero length or non-finite). */
function unit(a: Vec): Vec | null {
    const len = length(a);
    if (!(len > 0) || !Number.isFinite(len)) {
        return null;
    }
    return { x: a.x / len, y: a.y / len, z: a.z / len };
}

/**
 * A FreeCamera that rolls to keep the car's up direction in its picture while looking at the target.
 *
 * The camera starts upright (world +Y). If the eye-to-target line is itself vertical, world +Z is used
 * instead, since +Y would leave the camera with no roll reference.
 *
 * `bank(up)` sets the camera's up vector to `up`. The look-at writer projects that vector onto the plane
 * perpendicular to the line of sight, so the picture-up is the closest achievable match to `up`. When
 * `up` is parallel to the line of sight (or the camera sits on its target), the roll is undefined and the
 * call leaves the previous roll in place. The target is looked at either way.
 */
export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const initialForward = unit(sub(target, eye));
    const initialUp: Vec =
        initialForward !== null && Math.hypot(initialForward.x, initialForward.z) < DEGENERATE_SINE
            ? { x: 0, y: 0, z: 1 }
            : { x: 0, y: 1, z: 0 };

    const camera = createBankedFreeCamera(eye, target, initialUp);
    const upVector = camera.upVector;

    return {
        camera,
        bank(up: Vec): void {
            const u = unit(up);
            if (u === null) {
                return;
            }
            // Use the camera's current position and target, so moving them later is respected.
            const forward = unit(sub(camera.target, camera.position));
            if (forward === null) {
                return;
            }
            // Sine of the angle between up and the line of sight. Written as !(>=) so NaN is also rejected.
            const sine = length(cross(u, forward));
            if (!(sine >= DEGENERATE_SINE)) {
                return;
            }
            upVector.set(u.x, u.y, u.z);
        },
    };
}
