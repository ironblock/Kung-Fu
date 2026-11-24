import { createBankedFreeCamera, type FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

// Below this length, the car's up is (numerically) along the line of sight
// and has no roll direction, so the previous roll is kept.
const DEGENERATE_EPS = 1e-9;

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    // Starts upright: world +Y as the up vector.
    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: 0, y: 1, z: 0 },
    );

    // Unit line of sight from eye to target. The camera never moves,
    // so this is computed once.
    const fx = target.x - eye.x;
    const fy = target.y - eye.y;
    const fz = target.z - eye.z;
    const flen = Math.hypot(fx, fy, fz);
    const f = { x: fx / flen, y: fy / flen, z: fz / flen };

    return {
        camera,
        bank(up: Vec): void {
            // Remove the component of up along the line of sight. What is left
            // is the closest up direction the picture can show while still
            // looking at the target.
            const d = up.x * f.x + up.y * f.y + up.z * f.z;
            const px = up.x - d * f.x;
            const py = up.y - d * f.y;
            const pz = up.z - d * f.z;
            const plen = Math.hypot(px, py, pz);

            // Up is along the line of sight: no roll is defined, keep the previous roll.
            if (!(plen > DEGENERATE_EPS)) return;

            camera.upVector.x = px / plen;
            camera.upVector.y = py / plen;
            camera.upVector.z = pz / plen;
        },
    };
}
