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
    const camera = createFreeCamera({ ...eye }, { ...target });
    scene.camera = camera;

    // The free-camera controls steer by _yaw/_pitch, which the library only
    // computes at creation. Let the library compute them for the new view by
    // creating a throwaway camera there, then copy its angles across.
    const detachControls = attachFreeControl(camera, canvas, scene);
    let disposed = false;

    return {
        camera,
        jumpTo(newEye: Vec, newTarget: Vec): void {
            const probe = createFreeCamera({ ...newEye }, { ...newTarget });
            camera._yaw = probe._yaw;
            camera._pitch = probe._pitch;

            camera.position.x = newEye.x;
            camera.position.y = newEye.y;
            camera.position.z = newEye.z;
            camera.target.x = newTarget.x;
            camera.target.y = newTarget.y;
            camera.target.z = newTarget.z;
        },
        dispose(): void {
            if (disposed) return;
            disposed = true;
            detachControls();
        },
    };
}
