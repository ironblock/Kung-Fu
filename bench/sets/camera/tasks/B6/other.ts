import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

// Another right answer: compare the up vector with the unit line of sight by their dot product. The line of
// sight is read from the camera on each call, since the app moves the camera with the car.
export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const camera = createBankedFreeCamera(eye, target);
    return {
        camera,
        bank(up: Vec): void {
            const p = camera.position;
            const t = camera.target;
            const len = Math.hypot(t.x - p.x, t.y - p.y, t.z - p.z);
            const along = (up.x * (t.x - p.x) + up.y * (t.y - p.y) + up.z * (t.z - p.z)) / len;
            if (Math.abs(along) < 0.999999) {
                camera.upVector.x = up.x;
                camera.upVector.y = up.y;
                camera.upVector.z = up.z;
            }
        },
    };
}
