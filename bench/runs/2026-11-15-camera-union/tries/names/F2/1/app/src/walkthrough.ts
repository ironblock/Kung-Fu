import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";

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

    // Returned by attachFreeControl; calling it removes the canvas listeners
    // and any per-frame work the controls registered.
    let detachControls: (() => void) | null = attachFreeControl(camera, canvas, scene);

    const reattachControls = (): void => {
        detachControls?.();
        detachControls = attachFreeControl(camera, canvas, scene);
    };

    return {
        camera,

        jumpTo(newEye: Vec, newTarget: Vec): void {
            camera.position.x = newEye.x;
            camera.position.y = newEye.y;
            camera.position.z = newEye.z;
            camera.target.x = newTarget.x;
            camera.target.y = newTarget.y;
            camera.target.z = newTarget.z;

            // Re-attach so the controls start fresh from the new view rather
            // than from any state they were holding for the previous one.
            reattachControls();
        },

        dispose(): void {
            detachControls?.();
            detachControls = null;
        },
    };
}
