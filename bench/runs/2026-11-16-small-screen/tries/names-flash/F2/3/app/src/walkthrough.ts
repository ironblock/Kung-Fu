import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";

export type Vec = { x: number; y: number; z: number };

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

    // The walkthrough owns the active scene camera.
    (scene as unknown as { camera: FreeCamera }).camera = camera;

    const attachControls = () =>
        (attachFreeControl(camera, canvas, scene) as (() => void) | undefined) ?? (() => {});

    let detach = attachControls();
    let disposed = false;

    const setView = (nextEye: Vec, nextTarget: Vec) => {
        const position = camera.position as unknown as { x: number; y: number; z: number };
        const lookTarget = camera.target as unknown as { x: number; y: number; z: number };

        position.x = nextEye.x;
        position.y = nextEye.y;
        position.z = nextEye.z;

        lookTarget.x = nextTarget.x;
        lookTarget.y = nextTarget.y;
        lookTarget.z = nextTarget.z;

        // Keep the internal orientation fields consistent with the new view.
        // This helps if the attached controls cache yaw/pitch rather than
        // recomputing them from position/target every frame.
        const orientation = createFreeCamera(nextEye, nextTarget);
        if (Number.isFinite(orientation._yaw)) {
            camera._yaw = orientation._yaw;
        }
        if (Number.isFinite(orientation._pitch)) {
            camera._pitch = orientation._pitch;
        }
    };

    return {
        camera,

        jumpTo(nextEye: Vec, nextTarget: Vec) {
            if (disposed) return;

            // Detach before mutating the camera so the old controls do not see
            // a half-updated view, then reattach so keyboard/mouse controls
            // start from the new viewpoint.
            detach();
            setView(nextEye, nextTarget);
            detach = attachControls();
        },

        dispose() {
            if (disposed) return;

            disposed = true;
            detach();
            detach = () => {};
        },
    };
}
