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
    const camera = createFreeCamera(eye, target);
    scene.camera = camera;

    // Free-camera controls steer by _yaw/_pitch, which are only computed at
    // creation. Keeping the disposer lets us remove the canvas listeners.
    const detach = attachFreeControl(camera, canvas, scene);
    let disposed = false;

    function jumpTo(newEye: Vec, newTarget: Vec): void {
        // Derive yaw/pitch for the new view using the library's own
        // convention, by letting createFreeCamera compute them, then copy
        // them onto the live camera so W and mouse-drag continue from here.
        const fresh = createFreeCamera(newEye, newTarget);
        camera._yaw = fresh._yaw;
        camera._pitch = fresh._pitch;

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
            if (disposed) return;
            disposed = true;
            detach();
        },
    };
}
