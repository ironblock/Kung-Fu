import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
    readonly camera: FreeCamera;
    jumpTo(eye: Vec, target: Vec): void;
    dispose(): void;
}

function copyVec(v: Vec): Vec {
    return { x: v.x, y: v.y, z: v.z };
}

/**
 * Free-camera walkthrough with the library's standard keyboard and mouse
 * controls (attachFreeControl). Each jumpTo builds a fresh FreeCamera that
 * the library orients from eye/target, then reattaches the controls to it,
 * so W and mouse drag continue from the new view.
 */
export function createWalkthrough(
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    eye: Vec,
    target: Vec,
): Walkthrough {
    let camera = createFreeCamera(copyVec(eye), copyVec(target));
    scene.camera = camera;
    let detach = attachFreeControl(camera, canvas, scene);
    let disposed = false;

    return {
        get camera(): FreeCamera {
            return camera;
        },

        jumpTo(newEye: Vec, newTarget: Vec): void {
            if (disposed) return;
            detach();
            camera = createFreeCamera(copyVec(newEye), copyVec(newTarget));
            scene.camera = camera;
            detach = attachFreeControl(camera, canvas, scene);
        },

        dispose(): void {
            if (disposed) return;
            disposed = true;
            detach();
        },
    };
}
