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
    const camera = createFreeCamera(eye, target);
    // The walkthrough camera is the scene's active camera.
    scene.camera = camera;

    // Keyboard and mouse controls. The scene is passed so the controls run
    // from the scene's per-frame hook (without it they do nothing).
    let detach: (() => void) | null = attachFreeControl(camera, canvas, scene);

    return {
        camera,

        jumpTo(newEye: Vec, newTarget: Vec): void {
            // position and target are observables: write their components.
            camera.position.x = newEye.x;
            camera.position.y = newEye.y;
            camera.position.z = newEye.z;
            camera.target.x = newTarget.x;
            camera.target.y = newTarget.y;
            camera.target.z = newTarget.z;

            // The controls turn the view back to _yaw/_pitch on the next input
            // frame, so they must match the new direction. Take them from a
            // camera built for the new eye/target, so no angle convention is
            // assumed here.
            const fresh = createFreeCamera(newEye, newTarget);
            camera._yaw = fresh._yaw;
            camera._pitch = fresh._pitch;
        },

        dispose(): void {
            if (detach) {
                detach();
                detach = null;
            }
        },
    };
}
