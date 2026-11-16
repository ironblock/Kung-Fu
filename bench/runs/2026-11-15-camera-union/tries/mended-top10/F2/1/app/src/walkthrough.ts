import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
    readonly camera: FreeCamera;
    jumpTo(eye: Vec, target: Vec): void;
    dispose(): void;
}

// Point the camera's yaw/pitch along from -> to. The free-camera controls
// derive their movement direction from these values (captured when the
// controls are attached), so they must match the new view before the
// controls are re-attached. Convention assumed: Babylon's
// (yaw = atan2(x, z), pitch = atan(-y / horizontal)).
function aimYawPitch(camera: FreeCamera, from: Vec, to: Vec): void {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dz = to.z - from.z;
    const horizontal = Math.hypot(dx, dz);
    camera._yaw = Math.atan2(dx, dz);
    camera._pitch = Math.atan2(-dy, horizontal);
}

export function createWalkthrough(
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    eye: Vec,
    target: Vec,
): Walkthrough {
    const camera = createFreeCamera({ x: eye.x, y: eye.y, z: eye.z }, { x: target.x, y: target.y, z: target.z });
    aimYawPitch(camera, eye, target);
    scene.camera = camera;

    let detachControls: (() => void) | null = attachFreeControl(camera, canvas, scene);
    let disposed = false;

    return {
        camera,

        jumpTo(newEye: Vec, newTarget: Vec): void {
            if (disposed) return;

            // Detach first so the controls cannot act on the old state mid-jump.
            detachControls?.();
            detachControls = null;

            // Write in place: the camera's ObservableVec3 objects are readonly.
            camera.position.x = newEye.x;
            camera.position.y = newEye.y;
            camera.position.z = newEye.z;
            camera.target.x = newTarget.x;
            camera.target.y = newTarget.y;
            camera.target.z = newTarget.z;

            aimYawPitch(camera, newEye, newTarget);

            // Re-attach so the controls pick up the new view.
            detachControls = attachFreeControl(camera, canvas, scene);
        },

        dispose(): void {
            if (disposed) return;
            disposed = true;
            detachControls?.();
            detachControls = null;
        },
    };
}
