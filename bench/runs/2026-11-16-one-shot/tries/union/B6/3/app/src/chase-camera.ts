import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera { camera: FreeCamera; bank(up: Vec): void }

const EPS = 1e-6;

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    // Banked camera starts upright (world +Y). Pass fresh objects so the
    // caller's vectors are not aliased.
    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: 0, y: 1, z: 0 },
    );

    const bank = (up: Vec): void => {
        // Unit view direction from the eye to the look point.
        const fx = camera.target.x - camera.position.x;
        const fy = camera.target.y - camera.position.y;
        const fz = camera.target.z - camera.position.z;
        const fl = Math.hypot(fx, fy, fz);
        if (!(fl > EPS)) return; // eye on target: no direction, keep roll
        const dx = fx / fl, dy = fy / fl, dz = fz / fl;

        // Remove the component of `up` along the view direction. What is left
        // is the closest achievable camera up that is perpendicular to the view.
        const d = up.x * dx + up.y * dy + up.z * dz;
        const wx = up.x - d * dx;
        const wy = up.y - d * dy;
        const wz = up.z - d * dz;
        const wl = Math.hypot(wx, wy, wz);
        // up is (nearly) along the line of sight: no roll is defined, keep the previous one.
        if (!(wl > EPS)) return;

        // Writing upVector rolls the camera; the target is not changed.
        const ux = camera.upVector;
        ux.x = wx / wl;
        ux.y = wy / wl;
        ux.z = wz / wl;
    };

    return { camera, bank };
}
