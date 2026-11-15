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

    const detachControls = attachFreeControl(camera, canvas, scene);

    return {
        camera,

        jumpTo(newEye: Vec, newTarget: Vec): void {
            // Let the library derive its own orientation state (yaw/pitch) for the
            // new eye/target pair, so W and mouse-drag work from the new view.
            const oriented = createFreeCamera(
                { x: newEye.x, y: newEye.y, z: newEye.z },
                { x: newTarget.x, y: newTarget.y, z: newTarget.z },
            );
            camera._yaw = oriented._yaw;
            camera._pitch = oriented._pitch;

            camera.position.x = newEye.x;
            camera.position.y = newEye.y;
            camera.position.z = newEye.z;
            camera.target.x = newTarget.x;
            camera.target.y = newTarget.y;
            camera.target.z = newTarget.z;
        },

        dispose(): void {
            detachControls();
        },
    };
}
