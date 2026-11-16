import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Below this length, the car's up is (nearly) along the line of sight and
// has no usable screen-space direction; the roll is then left unchanged.
const DEGENERATE_EPSILON = 1e-6;

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    // Start upright: world up is (0, 1, 0).
    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: 0, y: 1, z: 0 },
    );

    return {
        camera,
        bank(up: Vec): void {
            const pos = camera.position;
            const tgt = camera.target;

            // Unit line of sight, from the camera toward the target.
            let fx = tgt.x - pos.x;
            let fy = tgt.y - pos.y;
            let fz = tgt.z - pos.z;
            const fLen = Math.hypot(fx, fy, fz);
            if (fLen === 0) {
                return;
            }
            fx /= fLen;
            fy /= fLen;
            fz /= fLen;

            // Remove the component of the car's up along the line of sight.
            // What remains is the closest direction to "up" that is visible
            // on screen; it is the roll that matches the car's up as closely
            // as possible.
            const dot = up.x * fx + up.y * fy + up.z * fz;
            const ux = up.x - dot * fx;
            const uy = up.y - dot * fy;
            const uz = up.z - dot * fz;
            const uLen = Math.hypot(ux, uy, uz);

            // Up is along the line of sight (either way): keep the previous roll.
            if (!(uLen > DEGENERATE_EPSILON)) {
                return;
            }

            const vec = camera.upVector;
            vec.x = ux / uLen;
            vec.y = uy / uLen;
            vec.z = uz / uLen;
        },
    };
}
