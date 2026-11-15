import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Below this length, the requested up is (numerically) along the line of sight
// and has no roll meaning; the previous roll is kept instead.
const DEGENERATE_EPSILON = 1e-6;

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    // Only the banked camera exposes an upVector; createFreeCamera always uses world +Y.
    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: 0, y: 1, z: 0 },
    );

    // The camera neither moves nor re-aims, so the line of sight is fixed.
    let fx = target.x - eye.x;
    let fy = target.y - eye.y;
    let fz = target.z - eye.z;
    const fl = Math.hypot(fx, fy, fz);
    fx /= fl;
    fy /= fl;
    fz /= fl;

    return {
        camera,
        bank(up: Vec): void {
            const ul = Math.hypot(up.x, up.y, up.z);
            const ux = up.x / ul;
            const uy = up.y / ul;
            const uz = up.z / ul;

            // Remove the component along the line of sight: the camera's up in
            // its picture is the closest achievable match to the requested up.
            const d = ux * fx + uy * fy + uz * fz;
            const px = ux - d * fx;
            const py = uy - d * fy;
            const pz = uz - d * fz;
            const pl = Math.hypot(px, py, pz);

            // Also catches NaN. Keep the previous roll and leave upVector untouched.
            if (!(pl >= DEGENERATE_EPSILON)) return;

            // Writing the components rolls the camera at once.
            camera.upVector.x = px / pl;
            camera.upVector.y = py / pl;
            camera.upVector.z = pz / pl;
        },
    };
}
