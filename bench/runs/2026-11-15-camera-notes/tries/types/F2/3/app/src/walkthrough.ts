import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
    readonly camera: FreeCamera;
    jumpTo(eye: Vec, target: Vec): void;
    dispose(): void;
}

/**
 * Free-camera walkthrough with the library's standard keyboard and mouse
 * controls (attachFreeControl). Viewpoints can be jumped to at any time; the
 * controls resume from the new view.
 */
export function createWalkthrough(
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    eye: Vec,
    target: Vec,
): Walkthrough {
    const camera = createFreeCamera({ x: eye.x, y: eye.y, z: eye.z }, { x: target.x, y: target.y, z: target.z });
    scene.camera = camera;

    let detach: (() => void) | null = null;
    const attach = () => {
        detach = attachFreeControl(camera, canvas, scene);
    };
    const detachNow = () => {
        if (detach) {
            detach();
            detach = null;
        }
    };

    attach();

    return {
        camera,

        jumpTo(newEye: Vec, newTarget: Vec): void {
            // Drop the controls first so their per-frame and inertia state
            // cannot carry the old view forward, then move the camera.
            detachNow();

            camera.position.x = newEye.x;
            camera.position.y = newEye.y;
            camera.position.z = newEye.z;
            camera.target.x = newTarget.x;
            camera.target.y = newTarget.y;
            camera.target.z = newTarget.z;

            // The controls steer by the camera's yaw/pitch, not by target alone.
            // A freshly built camera on the same eye/target gives the yaw/pitch
            // the library derives for that view, so copy them across rather than
            // re-deriving the convention here.
            const fresh = createFreeCamera(
                { x: newEye.x, y: newEye.y, z: newEye.z },
                { x: newTarget.x, y: newTarget.y, z: newTarget.z },
            );
            camera._yaw = fresh._yaw;
            camera._pitch = fresh._pitch;

            attach();
        },

        dispose(): void {
            detachNow();
        },
    };
}
