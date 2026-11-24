import { createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ChaseCamera {
    camera: FreeCamera;
    bank(up: Vec): void;
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
    const camera = createBankedFreeCamera(eye, target);
    return {
        camera,
        bank(up: Vec): void {
            camera.upVector.set(up.x, up.y, up.z);
        },
    };
}
