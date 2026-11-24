import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
    readonly camera: FreeCamera;
    jumpTo(eye: Vec, target: Vec): void;
    dispose(): void;
}

// Same limit the free-camera drag uses (notes 40): keeps the view off the poles.
const PITCH_LIMIT = Math.PI / 2 - 0.01;

// attachFreeControl aims from camera._yaw/_pitch, not from target (notes 5, 52),
// so the angles must be set with the position and target. The yaw follows
// notes 52 (atan2(dx, dz), 0 looks along +Z). The pitch sign is NOT in the
// notes; this assumes the Babylon convention, where positive pitch looks down.
function aimCamera(camera: FreeCamera, eye: Vec, target: Vec): void {
    // Position and target are written in place (the controls and view read these objects).
    camera.position.x = eye.x;
    camera.position.y = eye.y;
    camera.position.z = eye.z;
    camera.target.x = target.x;
    camera.target.y = target.y;
    camera.target.z = target.z;

    const dx = target.x - eye.x;
    const dy = target.y - eye.y;
    const dz = target.z - eye.z;
    const len = Math.hypot(dx, dy, dz);
    if (len === 0) {
        // No direction to aim at; keep the current yaw and pitch.
        return;
    }
    camera._yaw = Math.atan2(dx, dz);
    const pitch = -Math.asin(dy / len);
    camera._pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitch));
}

export function createWalkthrough(
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    eye: Vec,
    target: Vec,
): Walkthrough {
    const camera = createFreeCamera({ x: eye.x, y: eye.y, z: eye.z }, { x: target.x, y: target.y, z: target.z });
    aimCamera(camera, eye, target);
    scene.camera = camera;

    const detachControls = attachFreeControl(camera, canvas, scene);
    let disposed = false;

    return {
        camera,
        jumpTo(newEye: Vec, newTarget: Vec): void {
            aimCamera(camera, newEye, newTarget);
        },
        dispose(): void {
            if (disposed) return;
            disposed = true;
            // Returned function removes the canvas listeners and the per-frame hook (notes 15, 30).
            detachControls();
        },
    };
}
