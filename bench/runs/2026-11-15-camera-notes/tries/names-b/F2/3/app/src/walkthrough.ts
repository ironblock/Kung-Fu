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

    let detach: (() => void) | null = null;
    let disposed = false;

    const attach = (): void => {
        detach = attachFreeControl(camera, canvas, scene);
    };
    const detachControls = (): void => {
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
            // Drop the controls so they are rebuilt from the new view rather than
            // continuing from the old one, then move the camera and reattach.
            detachControls();
            camera.position.x = newEye.x;
            camera.position.y = newEye.y;
            camera.position.z = newEye.z;
            camera.target.x = newTarget.x;
            camera.target.y = newTarget.y;
            camera.target.z = newTarget.z;
            attach();
        },

        dispose(): void {
            if (disposed) return;
            disposed = true;
            detachControls();
        },
    };
}
