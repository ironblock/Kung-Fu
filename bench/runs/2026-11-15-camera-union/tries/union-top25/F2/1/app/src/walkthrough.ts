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

    // The free controls aim from camera._yaw / camera._pitch, not from the target
    // field, so a jump has to set those too. A camera created at the new eye and
    // target carries the yaw/pitch that aims it there; copy them across.
    const aim = (eyeNow: Vec, targetNow: Vec): void => {
        const scratch = createFreeCamera(
            { x: eyeNow.x, y: eyeNow.y, z: eyeNow.z },
            { x: targetNow.x, y: targetNow.y, z: targetNow.z },
        );
        camera._yaw = scratch._yaw;
        camera._pitch = scratch._pitch;
    };

    aim(eye, target);
    let detach: (() => void) | null = attachFreeControl(camera, canvas, scene);

    return {
        camera,
        jumpTo(newEye: Vec, newTarget: Vec): void {
            if (detach === null) return;
            camera.position.x = newEye.x;
            camera.position.y = newEye.y;
            camera.position.z = newEye.z;
            camera.target.x = newTarget.x;
            camera.target.y = newTarget.y;
            camera.target.z = newTarget.z;
            aim(newEye, newTarget);
        },
        dispose(): void {
            if (detach === null) return;
            detach();
            detach = null;
        },
    };
}
