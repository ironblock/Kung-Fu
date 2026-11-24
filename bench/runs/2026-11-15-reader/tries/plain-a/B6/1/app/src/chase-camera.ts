import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// The library's look-at falls back to an identity rotation when the up vector is parallel to the
// line of sight (sin of the angle below 1e-10). That fallback would discard the roll, so we treat
// any up vector this close to parallel as degenerate ourselves and keep the previous roll instead.
// The threshold sits above the library's own cutoff so we never hand it a degenerate up.
const PARALLEL_SIN_EPSILON = 1e-9;

/**
 * Creates a camera at `eye` looking at `target`, starting upright (world +Y).
 * Call `bank(up)` each frame with the car's unit up direction to roll the camera so its picture-up
 * follows that direction as closely as possible while it keeps looking at `target`.
 */
export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: 0, y: 1, z: 0 },
    );

    return {
        camera,
        bank(up: Vec): void {
            // Unit line of sight from the camera to its target.
            const zx0 = camera.target.x - camera.position.x;
            const zy0 = camera.target.y - camera.position.y;
            const zz0 = camera.target.z - camera.position.z;
            const zLen = Math.hypot(zx0, zy0, zz0);
            const upLen = Math.hypot(up.x, up.y, up.z);
            if (zLen === 0 || upLen === 0) {
                return; // No defined view direction or up: keep the previous roll.
            }
            const zx = zx0 / zLen;
            const zy = zy0 / zLen;
            const zz = zz0 / zLen;

            // |up x z| / |up| is the sine of the angle between up and the line of sight.
            const cx = up.y * zz - up.z * zy;
            const cy = up.z * zx - up.x * zz;
            const cz = up.x * zy - up.y * zx;
            const sinAngle = Math.hypot(cx, cy, cz) / upLen;
            if (sinAngle < PARALLEL_SIN_EPSILON) {
                return; // Up is along the line of sight (either way): keep looking, keep roll.
            }

            // The look-at basis projects `up` onto the view plane itself, so the raw up direction
            // gives the picture-up closest to it.
            camera.upVector.set(up.x, up.y, up.z);
        },
    };
}
