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

    // Moves the camera to the given view. The free-camera controls steer by
    // _yaw/_pitch (computed only at creation), so those must match the new view
    // or the next key press or drag would snap back to the old direction.
    // A throwaway camera made from the same eye/target gives the library's own
    // yaw/pitch values, so no angle convention has to be re-derived here.
    const pose = (e: Vec, t: Vec): void => {
        camera.position.x = e.x;
        camera.position.y = e.y;
        camera.position.z = e.z;
        camera.target.x = t.x;
        camera.target.y = t.y;
        camera.target.z = t.z;
        const angles = createFreeCamera({ x: e.x, y: e.y, z: e.z }, { x: t.x, y: t.y, z: t.z });
        camera._yaw = angles._yaw;
        camera._pitch = angles._pitch;
    };

    pose(eye, target);

    let detachControls: (() => void) | null = attachFreeControl(camera, canvas, scene);

    return {
        camera,
        jumpTo(e: Vec, t: Vec): void {
            if (detachControls === null) return;
            pose(e, t);
        },
        dispose(): void {
            if (detachControls === null) return;
            detachControls();
            detachControls = null;
        },
    };
}
