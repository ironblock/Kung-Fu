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

    // Keyboard and mouse controls aim from camera._yaw / camera._pitch, not from
    // the target field, so those must be kept in step with every jump.
    const detach = attachFreeControl(camera, canvas, scene);

    function jumpTo(newEye: Vec, newTarget: Vec): void {
        // Let the library derive yaw/pitch for this eye/target pair: a throwaway
        // camera created with the same arguments carries the angles it computes.
        // This avoids assuming the library's yaw/pitch convention.
        const probe = createFreeCamera(
            { x: newEye.x, y: newEye.y, z: newEye.z },
            { x: newTarget.x, y: newTarget.y, z: newTarget.z },
        );
        camera._yaw = probe._yaw;
        camera._pitch = probe._pitch;

        camera.position.x = newEye.x;
        camera.position.y = newEye.y;
        camera.position.z = newEye.z;
        camera.target.x = newTarget.x;
        camera.target.y = newTarget.y;
        camera.target.z = newTarget.z;
    }

    return {
        camera,
        jumpTo,
        dispose(): void {
            detach();
        },
    };
}
