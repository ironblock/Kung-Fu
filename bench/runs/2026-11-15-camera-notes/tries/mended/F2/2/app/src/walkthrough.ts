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

    let detach: () => void = attachFreeControl(camera, canvas, scene);
    let disposed = false;

    return {
        camera,

        jumpTo(newEye: Vec, newTarget: Vec): void {
            if (disposed) return;

            // The free controls aim from _yaw/_pitch, not from target, so derive
            // them from the new view using the library's own convention.
            const aim = createFreeCamera({ x: newEye.x, y: newEye.y, z: newEye.z }, { x: newTarget.x, y: newTarget.y, z: newTarget.z });

            // Drop the old controls first so their pending inertia and held-key
            // state cannot carry the viewer away from the new view.
            detach();

            camera.position.x = newEye.x;
            camera.position.y = newEye.y;
            camera.position.z = newEye.z;
            camera.target.x = newTarget.x;
            camera.target.y = newTarget.y;
            camera.target.z = newTarget.z;
            camera._yaw = aim._yaw;
            camera._pitch = aim._pitch;

            detach = attachFreeControl(camera, canvas, scene);
        },

        dispose(): void {
            if (disposed) return;
            disposed = true;
            detach();
        },
    };
}
