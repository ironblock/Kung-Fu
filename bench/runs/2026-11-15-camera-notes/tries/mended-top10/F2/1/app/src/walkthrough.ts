import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
    readonly camera: FreeCamera;
    jumpTo(eye: Vec, target: Vec): void;
    dispose(): void;
}

export function createWalkthrough(canvas: HTMLCanvasElement, scene: SceneContext, eye: Vec, target: Vec): Walkthrough {
    const camera = createFreeCamera({ x: eye.x, y: eye.y, z: eye.z }, { x: target.x, y: target.y, z: target.z });
    scene.camera = camera;

    let detachControls: (() => void) | null = attachFreeControl(camera, canvas, scene);

    return {
        camera,

        jumpTo(newEye: Vec, newTarget: Vec): void {
            // The free controls rebuild target from the camera's yaw and pitch on the first key move
            // (notes item 9), so a bare write to target would be overwritten. Let the library compute the
            // yaw/pitch for the new view from a throwaway camera, copy them across, and re-attach the
            // controls so they start from the new view.
            const probe = createFreeCamera({ x: newEye.x, y: newEye.y, z: newEye.z }, { x: newTarget.x, y: newTarget.y, z: newTarget.z });

            camera.position.x = newEye.x;
            camera.position.y = newEye.y;
            camera.position.z = newEye.z;
            camera.target.x = newTarget.x;
            camera.target.y = newTarget.y;
            camera.target.z = newTarget.z;
            camera._yaw = probe._yaw;
            camera._pitch = probe._pitch;

            if (detachControls) {
                detachControls();
                detachControls = attachFreeControl(camera, canvas, scene);
            }
        },

        dispose(): void {
            if (detachControls) {
                detachControls();
                detachControls = null;
            }
        },
    };
}
