import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Hollow try B6-h2: the line of sight is worked out once, from eye and target at creation. Right while the
// camera stays where it was made, as in the check; wrong once the app moves the camera with the car.
export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const camera = createBankedFreeCamera(eye, target);
    const len = Math.hypot(target.x - eye.x, target.y - eye.y, target.z - eye.z);
    const sight = { x: (target.x - eye.x) / len, y: (target.y - eye.y) / len, z: (target.z - eye.z) / len };
    return {
        camera,
        bank(up: Vec): void {
            if (Math.abs(up.x * sight.x + up.y * sight.y + up.z * sight.z) < 0.999999) {
                camera.upVector.set(up.x, up.y, up.z);
            }
        },
    };
}
