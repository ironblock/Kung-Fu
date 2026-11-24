import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
    readonly camera: FreeCamera;
    jumpTo(eye: Vec, target: Vec): void;
    dispose(): void;
}

export function createWalkthrough(canvas: HTMLCanvasElement, scene: SceneContext, eye: Vec, target: Vec): Walkthrough {
    const camera = createFreeCamera(eye, target);
    scene.camera = camera;

    let detachControls: (() => void) | null = attachFreeControl(camera, canvas, scene);

    function detach(): void {
        const detachNow = detachControls;
        detachControls = null;
        detachNow?.();
    }

    return {
        camera,

        jumpTo(newEye: Vec, newTarget: Vec): void {
            // Copy first: the caller may pass camera.position / camera.target themselves.
            const e = { x: newEye.x, y: newEye.y, z: newEye.z };
            const t = { x: newTarget.x, y: newTarget.y, z: newTarget.z };

            // Restart the controls around the new pose, so that no leftover momentum or
            // state they cached from the old view carries over. After dispose, only move.
            const reattach = detachControls !== null;
            detach();
            setPose(camera, e, t);
            if (reattach) detachControls = attachFreeControl(camera, canvas, scene);
        },

        dispose(): void {
            detach();
        },
    };
}

/** Put `camera` at `eye` looking at `target`, including the look angles the controls steer by. */
function setPose(camera: FreeCamera, eye: Vec, target: Vec): void {
    // Mouse look and WASD work from the camera's _yaw/_pitch, and writing `target` is not
    // documented to update them. Use the angles the library itself gives a fresh camera with this view.
    const reference = createFreeCamera(eye, target);

    camera.position.x = eye.x;
    camera.position.y = eye.y;
    camera.position.z = eye.z;
    camera._yaw = reference._yaw;
    camera._pitch = reference._pitch;
    // Target last, so it ends up exactly as given even if an angle write re-derives it.
    camera.target.x = target.x;
    camera.target.y = target.y;
    camera.target.z = target.z;
}
