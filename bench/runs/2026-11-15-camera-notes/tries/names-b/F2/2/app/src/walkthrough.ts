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
    const camera = createFreeCamera({ x: eye.x, y: eye.y, z: eye.z }, { x: target.x, y: target.y, z: target.z });
    scene.camera = camera;

    // Place the camera at `eye` looking at `target`. The free-camera controls
    // steer from the internal yaw/pitch, so those must match the new view too.
    // A throwaway camera built by the library gives us the yaw/pitch that
    // correspond to this eye/target pair, so we don't have to guess the convention.
    const aim = (e: Vec, t: Vec): void => {
        camera.position.x = e.x;
        camera.position.y = e.y;
        camera.position.z = e.z;
        camera.target.x = t.x;
        camera.target.y = t.y;
        camera.target.z = t.z;

        const probe = createFreeCamera({ x: e.x, y: e.y, z: e.z }, { x: t.x, y: t.y, z: t.z });
        camera._yaw = probe._yaw;
        camera._pitch = probe._pitch;
    };

    aim(eye, target);

    const detach = attachFreeControl(camera, canvas, scene);

    return {
        camera,
        jumpTo(newEye: Vec, newTarget: Vec): void {
            aim(newEye, newTarget);
        },
        dispose(): void {
            detach();
        },
    };
}
