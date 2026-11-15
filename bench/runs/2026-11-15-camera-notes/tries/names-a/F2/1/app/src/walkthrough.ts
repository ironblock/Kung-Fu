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
    const camera = createFreeCamera(eye, target);
    scene.camera = camera;

    // Keyboard and mouse controls. The returned function removes all of their
    // canvas listeners and per-frame work.
    const detachControls = attachFreeControl(camera, canvas, scene);

    function jumpTo(newEye: Vec, newTarget: Vec): void {
        camera.position.x = newEye.x;
        camera.position.y = newEye.y;
        camera.position.z = newEye.z;
        camera.target.x = newTarget.x;
        camera.target.y = newTarget.y;
        camera.target.z = newTarget.z;

        // The free controls keep their orientation in _yaw/_pitch. Setting only
        // position and target would leave those stale, so the next drag or W
        // press would snap back to the old view. Take the library's own
        // yaw/pitch for this eye/target by building a throwaway camera, which
        // avoids guessing its angle convention.
        const oriented = createFreeCamera(newEye, newTarget);
        camera._yaw = oriented._yaw;
        camera._pitch = oriented._pitch;
    }

    return {
        camera,
        jumpTo,
        dispose(): void {
            detachControls();
        },
    };
}
