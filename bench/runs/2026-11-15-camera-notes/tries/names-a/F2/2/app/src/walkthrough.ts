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

    let detach: () => void = attachFreeControl(camera, canvas, scene);
    let disposed = false;

    // Point the camera at `eye` -> `target`. The controls read the orientation
    // from _yaw/_pitch, not just from position/target, so those must be kept in
    // step with the new view or the next mouse drag would snap back to the old one.
    // The yaw/pitch convention below is the usual free-camera one (forward =
    // (sin yaw * cos pitch, -sin pitch, cos yaw * cos pitch)); it is not verified
    // against the library source, which is not available here.
    function applyView(from: Vec, to: Vec): void {
        camera.position.x = from.x;
        camera.position.y = from.y;
        camera.position.z = from.z;
        camera.target.x = to.x;
        camera.target.y = to.y;
        camera.target.z = to.z;

        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dz = to.z - from.z;
        const horizontal = Math.hypot(dx, dz);
        if (horizontal === 0 && dy === 0) {
            return; // degenerate: eye and target coincide, keep current orientation
        }
        camera._yaw = Math.atan2(dx, dz);
        camera._pitch = Math.atan2(-dy, horizontal);
    }

    applyView(eye, target);

    return {
        camera,
        jumpTo(newEye: Vec, newTarget: Vec): void {
            applyView(newEye, newTarget);
            if (disposed) {
                return;
            }
            // Re-attach so the controls start fresh from the new view, with no
            // state carried over from before the jump.
            detach();
            detach = attachFreeControl(camera, canvas, scene);
        },
        dispose(): void {
            if (disposed) {
                return;
            }
            disposed = true;
            detach();
        },
    };
}
