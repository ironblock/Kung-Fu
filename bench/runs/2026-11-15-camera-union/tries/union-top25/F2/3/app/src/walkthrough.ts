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

    // attachFreeControl aims from camera._yaw / camera._pitch, not from target,
    // so the controls only follow a jump if those angles are updated as well.
    const detach = attachFreeControl(camera, canvas, scene);

    return {
        camera,

        jumpTo(newEye: Vec, newTarget: Vec): void {
            // Let the library work out the yaw/pitch for the new aim direction,
            // rather than re-deriving its angle convention here.
            const aim = createFreeCamera({ x: newEye.x, y: newEye.y, z: newEye.z }, { x: newTarget.x, y: newTarget.y, z: newTarget.z });
            camera._yaw = aim._yaw;
            camera._pitch = aim._pitch;

            // Write in place: position and target are observable objects.
            camera.position.x = newEye.x;
            camera.position.y = newEye.y;
            camera.position.z = newEye.z;
            camera.target.x = newTarget.x;
            camera.target.y = newTarget.y;
            camera.target.z = newTarget.z;
        },

        dispose(): void {
            // Removes the canvas listeners added by attachFreeControl.
            // This walkthrough adds nothing that runs per frame.
            detach();
        },
    };
}
