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

export function createWalkthrough(canvas: HTMLCanvasElement, scene: SceneContext, eye: Vec, target: Vec): Walkthrough {
    const camera = createFreeCamera(copyVec(eye), copyVec(target));
    scene.camera = camera;

    // The free-camera controls steer by _yaw/_pitch, which the library computes
    // only when a camera is created. So a new pose must carry yaw/pitch with it,
    // otherwise the next W or drag would snap back to the old view.
    // A throwaway camera built from the new pose gives the library's own yaw/pitch.
    function applyPose(newEye: Vec, newTarget: Vec): void {
        const probe = createFreeCamera(copyVec(newEye), copyVec(newTarget));
        camera._yaw = probe._yaw;
        camera._pitch = probe._pitch;

        camera.position.x = newEye.x;
        camera.position.y = newEye.y;
        camera.position.z = newEye.z;
        camera.target.x = newTarget.x;
        camera.target.y = newTarget.y;
        camera.target.z = newTarget.z;
    }

    applyPose(eye, target);

    // Pass the scene so the controls run on the scene's frame loop.
    let detachControls: (() => void) | null = attachFreeControl(camera, canvas, scene);

    return {
        camera,
        jumpTo(newEye: Vec, newTarget: Vec): void {
            applyPose(newEye, newTarget);
        },
        dispose(): void {
            if (detachControls) {
                detachControls();
                detachControls = null;
            }
        },
    };
}
