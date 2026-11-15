import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
    readonly camera: FreeCamera;
    jumpTo(eye: Vec, target: Vec): void;
    dispose(): void;
}

function copyVec(dst: Vec, src: Vec): void {
    dst.x = src.x;
    dst.y = src.y;
    dst.z = src.z;
}

export function createWalkthrough(canvas: HTMLCanvasElement, scene: SceneContext, eye: Vec, target: Vec): Walkthrough {
    const camera = createFreeCamera({ x: eye.x, y: eye.y, z: eye.z }, { x: target.x, y: target.y, z: target.z });
    scene.camera = camera;

    // attachFreeControl aims from camera._yaw/_pitch (not from target), so the
    // controls only follow a new view if those angles are updated too. The
    // library computes them when a camera is created, so a fresh camera built
    // for the new view supplies the angles.
    const detach = attachFreeControl(camera, canvas, scene);

    return {
        camera,
        jumpTo(newEye: Vec, newTarget: Vec): void {
            const fresh = createFreeCamera(
                { x: newEye.x, y: newEye.y, z: newEye.z },
                { x: newTarget.x, y: newTarget.y, z: newTarget.z },
            );
            // Write in place so the camera's observable vectors are the ones updated.
            copyVec(camera.position, newEye);
            copyVec(camera.target, newTarget);
            camera._yaw = fresh._yaw;
            camera._pitch = fresh._pitch;
        },
        dispose(): void {
            detach();
        },
    };
}
