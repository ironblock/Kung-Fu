import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// If the car's up has less than this length left after removing its component
// along the line of sight, it is treated as parallel to the view and ignored.
const PARALLEL_EPSILON = 1e-6;

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const fx = target.x - eye.x;
    const fy = target.y - eye.y;
    const fz = target.z - eye.z;
    const fLen = Math.hypot(fx, fy, fz);
    if (!(fLen > 0)) {
        throw new RangeError("createChaseCamera: eye and target must differ");
    }
    // Unit line of sight, fixed for the life of the camera (eye and target never move).
    const fwd = { x: fx / fLen, y: fy / fLen, z: fz / fLen };

    // Starts upright: world +Y is the up hint. The banked camera keeps the
    // roll we write into upVector between frames.
    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: 0, y: 1, z: 0 },
    );

    return {
        camera,
        bank(up: Vec): void {
            // Remove the part of `up` along the line of sight; what remains lies in
            // the picture plane and is the closest achievable picture-up.
            const d = up.x * fwd.x + up.y * fwd.y + up.z * fwd.z;
            const px = up.x - d * fwd.x;
            const py = up.y - d * fwd.y;
            const pz = up.z - d * fwd.z;
            const pLen = Math.hypot(px, py, pz);

            // Up points along the line of sight (either way): no roll is defined.
            // Keep the previous roll and leave upVector untouched.
            if (pLen < PARALLEL_EPSILON) return;

            const uv = camera.upVector;
            uv.x = px / pLen;
            uv.y = py / pLen;
            uv.z = pz / pLen;
        },
    };
}
