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
    scene.camera = camera;

    let detach: (() => void) | null = null;
    let disposed = false;

    const attach = (): void => {
        detach = attachFreeControl(camera, canvas, scene);
    };
    const detachNow = (): void => {
        if (detach) {
            detach();
            detach = null;
        }
    };

    attach();

    return {
        camera,

        jumpTo(newEye: Vec, newTarget: Vec): void {
            if (disposed) return;

            // Controls may cache view state, so remove them while the camera is moved.
            detachNow();

            // Let the library compute the yaw/pitch that correspond to the new view,
            // so W and mouse-drag work from there without assuming an angle convention.
            const probe = createFreeCamera(newEye, newTarget);

            camera.position.x = newEye.x;
            camera.position.y = newEye.y;
            camera.position.z = newEye.z;
            camera.target.x = newTarget.x;
            camera.target.y = newTarget.y;
            camera.target.z = newTarget.z;
            camera._yaw = probe._yaw;
            camera._pitch = probe._pitch;

            attach();
        },

        dispose(): void {
            disposed = true;
            detachNow();
        },
    };
}
