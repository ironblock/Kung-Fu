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

    // attachFreeControl aims from camera._yaw / camera._pitch, not from target.
    // Setting only target would be overwritten on the next key press or drag.
    const detachControls = attachFreeControl(camera, canvas, scene);
    let disposed = false;

    const jumpTo = (newEye: Vec, newTarget: Vec): void => {
        if (disposed) return;

        // Let the library derive yaw/pitch for this view, so we don't have to
        // assume its angle convention. The probe camera is discarded.
        const probe = createFreeCamera({ ...newEye }, { ...newTarget });

        camera.position.x = newEye.x;
        camera.position.y = newEye.y;
        camera.position.z = newEye.z;

        camera.target.x = newTarget.x;
        camera.target.y = newTarget.y;
        camera.target.z = newTarget.z;

        camera._yaw = probe._yaw;
        camera._pitch = probe._pitch;
    };

    const dispose = (): void => {
        if (disposed) return;
        disposed = true;
        detachControls();
    };

    return { camera, jumpTo, dispose };
}
