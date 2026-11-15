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

function setVec(dst: Vec, src: Vec): void {
    dst.x = src.x;
    dst.y = src.y;
    dst.z = src.z;
}

export function createWalkthrough(
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    eye: Vec,
    target: Vec,
): Walkthrough {
    const camera: FreeCamera = createFreeCamera(copyVec(eye), copyVec(target));
    scene.camera = camera;

    // The library's standard free-camera keyboard and mouse controls.
    // The returned function removes their canvas/keyboard listeners and per-frame work.
    let detachControls: (() => void) | null = attachFreeControl(camera, canvas, scene);

    return {
        camera,

        jumpTo(newEye: Vec, newTarget: Vec): void {
            setVec(camera.position, newEye);
            setVec(camera.target, newTarget);

            // The controls steer by the camera's stored yaw/pitch, not by position/target.
            // Without this, W would keep flying along the old heading and a drag would
            // snap back toward the old view. A camera built from the new pose carries the
            // yaw/pitch that correspond to it, so copy those across.
            const aim = createFreeCamera(copyVec(newEye), copyVec(newTarget));
            camera._yaw = aim._yaw;
            camera._pitch = aim._pitch;
        },

        dispose(): void {
            if (detachControls) {
                detachControls();
                detachControls = null;
            }
        },
    };
}
