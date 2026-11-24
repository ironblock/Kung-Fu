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

    // attachFreeControl aims from camera._yaw/_pitch, not from camera.target,
    // so a target written by hand is discarded on the next key move or drag.
    // Keep those angles in step with every jump.
    const detachControls = attachFreeControl(camera, canvas, scene);

    let disposed = false;

    return {
        camera,

        jumpTo(newEye: Vec, newTarget: Vec): void {
            if (disposed) return;

            // Let the library derive yaw/pitch for this eye/target pair, so we
            // do not have to depend on its angle convention.
            const probe = createFreeCamera({ ...newEye }, { ...newTarget });

            camera.position.x = newEye.x;
            camera.position.y = newEye.y;
            camera.position.z = newEye.z;
            camera.target.x = newTarget.x;
            camera.target.y = newTarget.y;
            camera.target.z = newTarget.z;
            camera._yaw = probe._yaw;
            camera._pitch = probe._pitch;
        },

        dispose(): void {
            if (disposed) return;
            disposed = true;
            detachControls();
        },
    };
}
