import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
    readonly camera: FreeCamera;
    jumpTo(eye: Vec, target: Vec): void;
    dispose(): void;
}

// Same limit the free-camera controls use for pitch (notes item 48).
const MAX_PITCH = Math.PI / 2 - 0.01;

// The free-camera controls steer from the internal _yaw/_pitch, not from
// position/target, and only read those at creation (notes items 12, 47).
// So every pose change has to write them as well, or W and mouse turns
// would continue from the old view. yaw = atan2(dx, dz) and
// pitch = atan2(dy, horizontal) as described in the notes (item 12).
function applyPose(camera: FreeCamera, eye: Vec, target: Vec): void {
    camera.position.x = eye.x;
    camera.position.y = eye.y;
    camera.position.z = eye.z;

    camera.target.x = target.x;
    camera.target.y = target.y;
    camera.target.z = target.z;

    const dx = target.x - eye.x;
    const dy = target.y - eye.y;
    const dz = target.z - eye.z;
    const horizontal = Math.hypot(dx, dz);

    camera._yaw = Math.atan2(dx, dz);
    camera._pitch = Math.min(MAX_PITCH, Math.max(-MAX_PITCH, Math.atan2(dy, horizontal)));
}

export function createWalkthrough(
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    eye: Vec,
    target: Vec,
): Walkthrough {
    const camera = createFreeCamera(eye, target);
    applyPose(camera, eye, target);
    scene.camera = camera;

    // Passing the scene is required for the controls to move the camera
    // (notes item 27). The returned cleanup removes the canvas listeners
    // and the per-frame work (notes item 47 describes the controls).
    const detachControls = attachFreeControl(camera, canvas, scene);
    let disposed = false;

    return {
        camera,

        jumpTo(newEye: Vec, newTarget: Vec): void {
            applyPose(camera, newEye, newTarget);
        },

        dispose(): void {
            if (disposed) return;
            disposed = true;
            detachControls();
        },
    };
}
