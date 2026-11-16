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

    // The free controls aim from camera._yaw / camera._pitch, not from target,
    // so a jump has to set those too. Take them from a camera the library
    // builds for this eye/target, so the sign and angle conventions are the
    // library's own.
    function setPose(newEye: Vec, newTarget: Vec): void {
        const probe = createFreeCamera(newEye, newTarget);
        camera.position.x = newEye.x;
        camera.position.y = newEye.y;
        camera.position.z = newEye.z;
        camera.target.x = newTarget.x;
        camera.target.y = newTarget.y;
        camera.target.z = newTarget.z;
        camera._yaw = probe._yaw;
        camera._pitch = probe._pitch;
    }

    let disposed = false;
    // Re-attaching after a jump drops any turn or move still coasting from
    // before the jump, since that state lives in the controls' closure.
    let detach: (() => void) | null = attachFreeControl(camera, canvas, scene);

    return {
        camera,
        jumpTo(newEye: Vec, newTarget: Vec): void {
            setPose(newEye, newTarget);
            if (disposed) return;
            detach?.();
            detach = attachFreeControl(camera, canvas, scene);
        },
        dispose(): void {
            if (disposed) return;
            disposed = true;
            detach?.();
            detach = null;
        },
    };
}
