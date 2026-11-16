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

    // attachFreeControl aims from camera._yaw / camera._pitch, not from
    // position/target, and replaces target on the next key move or drag.
    // It returns the function that removes its canvas listeners and frame hook.
    const detach = attachFreeControl(camera, canvas, scene);

    function jumpTo(newEye: Vec, newTarget: Vec): void {
        // Let the library compute yaw/pitch for the new view, so the controls
        // pick up the same direction the target describes. The probe camera is
        // throwaway and is not added to the scene.
        const probe = createFreeCamera({ ...newEye }, { ...newTarget });
        camera._yaw = probe._yaw;
        camera._pitch = probe._pitch;

        camera.position.x = newEye.x;
        camera.position.y = newEye.y;
        camera.position.z = newEye.z;
        camera.target.x = newTarget.x;
        camera.target.y = newTarget.y;
        camera.target.z = newTarget.z;
    }

    function dispose(): void {
        detach();
    }

    return { camera, jumpTo, dispose };
}
