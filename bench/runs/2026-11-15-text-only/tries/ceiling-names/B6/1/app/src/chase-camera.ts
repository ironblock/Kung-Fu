import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Below this, the requested up is treated as lying along the line of sight,
// where the roll is undefined.
const PARALLEL_EPSILON = 1e-6;

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    // Copy the inputs so the caller's objects are not shared with the camera.
    const camera = createBankedFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
        { x: 0, y: 1, z: 0 },
    );

    function bank(up: Vec): void {
        // Current line of sight, read from the camera every call in case the
        // game has moved its position or target since the last frame.
        let fx = camera.target.x - camera.position.x;
        let fy = camera.target.y - camera.position.y;
        let fz = camera.target.z - camera.position.z;
        const fLen = Math.hypot(fx, fy, fz);
        if (!(fLen > 0)) return; // eye on target: no defined view direction
        fx /= fLen;
        fy /= fLen;
        fz /= fLen;

        // Drop the part of `up` along the line of sight. What is left is the
        // closest up the camera can have while still looking at the target.
        const d = up.x * fx + up.y * fy + up.z * fz;
        let ux = up.x - d * fx;
        let uy = up.y - d * fy;
        let uz = up.z - d * fz;
        const uLen = Math.hypot(ux, uy, uz);

        // `up` points along the line of sight (either way): the roll is
        // undefined, so keep the previous one and leave the camera untouched.
        if (!(uLen > PARALLEL_EPSILON)) return;

        ux /= uLen;
        uy /= uLen;
        uz /= uLen;
        camera.upVector.x = ux;
        camera.upVector.y = uy;
        camera.upVector.z = uz;
    }

    return { camera, bank };
}
