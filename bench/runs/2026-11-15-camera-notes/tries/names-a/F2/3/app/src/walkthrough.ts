import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
    readonly camera: FreeCamera;
    jumpTo(eye: Vec, target: Vec): void;
    dispose(): void;
}

function copyVec(v: Vec): Vec {
    return { x: v.x, y: v.y, z: v.z };
}

/**
 * Free-camera walkthrough with the library's standard keyboard/mouse controls.
 *
 * `jumpTo` builds a new FreeCamera for the requested view rather than writing
 * position/target onto the existing one. The camera's internal yaw/pitch are
 * derived when it is created, so the controls (W to fly, drag to turn) continue
 * correctly from the new view. The controls are detached from the old camera and
 * reattached to the new one, so nothing is left listening or running per frame.
 */
export function createWalkthrough(
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    eye: Vec,
    target: Vec,
): Walkthrough {
    let camera: FreeCamera = createFreeCamera(copyVec(eye), copyVec(target));
    scene.camera = camera;
    let detachControls: () => void = attachFreeControl(camera, canvas, scene);
    let disposed = false;

    return {
        get camera(): FreeCamera {
            return camera;
        },

        jumpTo(newEye: Vec, newTarget: Vec): void {
            if (disposed) return;
            detachControls();
            camera = createFreeCamera(copyVec(newEye), copyVec(newTarget));
            scene.camera = camera;
            detachControls = attachFreeControl(camera, canvas, scene);
        },

        dispose(): void {
            if (disposed) return;
            disposed = true;
            detachControls();
        },
    };
}
