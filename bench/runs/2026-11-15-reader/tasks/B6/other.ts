import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Another right answer: compare the up vector with the unit line of sight by their dot product.
export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const camera = createBankedFreeCamera(eye, target);
    const len = Math.hypot(target.x - eye.x, target.y - eye.y, target.z - eye.z);
    const sight = { x: (target.x - eye.x) / len, y: (target.y - eye.y) / len, z: (target.z - eye.z) / len };
    return {
        camera,
        bank(up: Vec): void {
            const along = up.x * sight.x + up.y * sight.y + up.z * sight.z;
            if (Math.abs(along) < 0.999999) {
                camera.upVector.x = up.x;
                camera.upVector.y = up.y;
                camera.upVector.z = up.z;
            }
        },
    };
}
