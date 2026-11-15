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

    let detach: (() => void) | null = null;
    let disposed = false;

    const attach = (): void => {
        detach = attachFreeControl(camera, canvas, scene);
    };
    attach();

    return {
        camera,

        jumpTo(newEye: Vec, newTarget: Vec): void {
            if (disposed) return;

            // The free-camera controls rebuild target from their own yaw/pitch on the
            // first key move (camera-notes.md, note 9), so a plain target write is not
            // enough. Take the yaw/pitch the library computes for this direction from a
            // throwaway camera, so the convention is not hard-coded here.
            const aim = createFreeCamera({ x: newEye.x, y: newEye.y, z: newEye.z }, { x: newTarget.x, y: newTarget.y, z: newTarget.z });

            // Stop the old controls before changing state under them, then reattach so
            // the new attach starts from the new yaw/pitch.
            detach?.();
            detach = null;

            camera._yaw = aim._yaw;
            camera._pitch = aim._pitch;
            camera.position.x = newEye.x;
            camera.position.y = newEye.y;
            camera.position.z = newEye.z;
            camera.target.x = newTarget.x;
            camera.target.y = newTarget.y;
            camera.target.z = newTarget.z;

            attach();
        },

        dispose(): void {
            disposed = true;
            detach?.();
            detach = null;
        },
    };
}
