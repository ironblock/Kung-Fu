import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
    readonly camera: FreeCamera;
    jumpTo(eye: Vec, target: Vec): void;
    dispose(): void;
}

// Pitch is clamped by the library's free-camera controls to +-(PI/2 - 0.01).
const PITCH_LIMIT = Math.PI / 2 - 0.01;

function setVec(dst: Vec, src: Vec): void {
    dst.x = src.x;
    dst.y = src.y;
    dst.z = src.z;
}

// Yaw follows the library's convention (0 looks along +Z): atan2(dx, dz).
function yawOf(eye: Vec, target: Vec): number {
    return Math.atan2(target.x - eye.x, target.z - eye.z);
}

// Magnitude of pitch for a look direction: atan2(dy, horizontal length).
// The sign convention of _pitch is not documented, so it is calibrated at
// creation against the value the library itself computes (see createWalkthrough).
function pitchMagnitudeOf(eye: Vec, target: Vec): number {
    const dx = target.x - eye.x;
    const dy = target.y - eye.y;
    const dz = target.z - eye.z;
    return Math.atan2(dy, Math.hypot(dx, dz));
}

export function createWalkthrough(
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    eye: Vec,
    target: Vec,
): Walkthrough {
    const camera = createFreeCamera({ x: eye.x, y: eye.y, z: eye.z }, { x: target.x, y: target.y, z: target.z });
    scene.camera = camera;

    // Work out whether the library's _pitch is positive when looking down or up,
    // by comparing its own value for the initial look with the magnitude we expect.
    const p0 = pitchMagnitudeOf(eye, target);
    const pitchSign = Math.abs(camera._pitch - p0) <= Math.abs(camera._pitch + p0) ? 1 : -1;

    if (canvas.tabIndex < 0) {
        canvas.tabIndex = 0; // keyboard events are heard on the canvas
    }

    let detach = attachFreeControl(camera, canvas, scene);
    let disposed = false;

    return {
        camera,

        jumpTo(newEye: Vec, newTarget: Vec): void {
            if (disposed) return;

            // Drop any coasting from the previous view and re-attach fresh.
            detach();

            setVec(camera.position, newEye);
            setVec(camera.target, newTarget);

            // The controls rebuild target from _yaw/_pitch on the next move,
            // so these must match the new look direction.
            camera._yaw = yawOf(newEye, newTarget);
            const pitch = pitchSign * pitchMagnitudeOf(newEye, newTarget);
            camera._pitch = Math.min(PITCH_LIMIT, Math.max(-PITCH_LIMIT, pitch));

            detach = attachFreeControl(camera, canvas, scene);
        },

        dispose(): void {
            if (disposed) return;
            disposed = true;
            detach();
        },
    };
}
