import { createBankedFreeCamera, type FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Below this length, the car's up is treated as parallel to the line of sight.
const PARALLEL_EPSILON = 1e-6;

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    // Only the banked variant exposes upVector, and writing it rolls the camera.
    // Start upright on world +Y.
    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: 0, y: 1, z: 0 },
    );

    return {
        camera,
        bank(up: Vec): void {
            const p = camera.position;
            const t = camera.target;

            // Unit line of sight from the camera toward its target.
            let fx = t.x - p.x;
            let fy = t.y - p.y;
            let fz = t.z - p.z;
            const fl = Math.hypot(fx, fy, fz);
            if (!(fl > 0)) {
                return; // Degenerate eye/target: nothing sensible to aim at.
            }
            fx /= fl;
            fy /= fl;
            fz /= fl;

            // Remove the component of the car's up along the line of sight,
            // leaving the closest up direction that is perpendicular to it.
            const d = up.x * fx + up.y * fy + up.z * fz;
            let ux = up.x - d * fx;
            let uy = up.y - d * fy;
            let uz = up.z - d * fz;
            const ul = Math.hypot(ux, uy, uz);

            // Up is (numerically) along the line of sight: no defined roll.
            // Keep the previous upVector so the roll stays as it was.
            if (!(ul > PARALLEL_EPSILON)) {
                return;
            }
            ux /= ul;
            uy /= ul;
            uz /= ul;

            const uv = camera.upVector;
            uv.x = ux;
            uv.y = uy;
            uv.z = uz;
        },
    };
}
