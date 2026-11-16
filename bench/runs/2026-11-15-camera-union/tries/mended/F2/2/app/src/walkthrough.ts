import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
    readonly camera: FreeCamera;
    jumpTo(eye: Vec, target: Vec): void;
    dispose(): void;
}

export function createWalkthrough(
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    eye: Vec,
    target: Vec,
): Walkthrough {
    const camera = createFreeCamera({ x: eye.x, y: eye.y, z: eye.z }, { x: target.x, y: target.y, z: target.z });
    scene.camera = camera;

    // The free-camera controls steer from camera._yaw / camera._pitch, not from
    // camera.target, so any view we set must update those as well.
    const aimCamera = (e: Vec, t: Vec): void => {
        // A throwaway camera built from the same eye/target gives the library's
        // own yaw/pitch for that direction, so we do not depend on its convention.
        const probe = createFreeCamera({ x: e.x, y: e.y, z: e.z }, { x: t.x, y: t.y, z: t.z });

        camera.position.x = e.x;
        camera.position.y = e.y;
        camera.position.z = e.z;
        camera.target.x = t.x;
        camera.target.y = t.y;
        camera.target.z = t.z;
        camera._yaw = probe._yaw;
        camera._pitch = probe._pitch;
    };

    const detach = attachFreeControl(camera, canvas, scene);

    return {
        camera,
        jumpTo(e: Vec, t: Vec): void {
            aimCamera(e, t);
        },
        dispose(): void {
            detach();
        },
    };
}
