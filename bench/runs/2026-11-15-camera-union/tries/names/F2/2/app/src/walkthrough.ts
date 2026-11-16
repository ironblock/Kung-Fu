import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
    readonly camera: FreeCamera;
    jumpTo(eye: Vec, target: Vec): void;
    dispose(): void;
}

/**
 * Converts a view direction into the free camera's internal yaw/pitch.
 *
 * ASSUMPTION: this uses the convention forward = (cos(p)·sin(y), -sin(p), cos(p)·cos(y)),
 * i.e. the same convention as Babylon's TargetCamera (positive pitch looks down).
 * The library's source is not available here, so this has not been verified against it.
 */
function yawPitchFromDirection(eye: Vec, target: Vec): { yaw: number; pitch: number } {
    const dx = target.x - eye.x;
    const dy = target.y - eye.y;
    const dz = target.z - eye.z;
    const len = Math.hypot(dx, dy, dz);
    if (len === 0) {
        return { yaw: 0, pitch: 0 };
    }
    const yaw = Math.atan2(dx, dz);
    const pitch = -Math.asin(dy / len);
    return { yaw, pitch };
}

export function createWalkthrough(
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    eye: Vec,
    target: Vec,
): Walkthrough {
    const camera: FreeCamera = createFreeCamera(
        { x: eye.x, y: eye.y, z: eye.z },
        { x: target.x, y: target.y, z: target.z },
    );
    scene.camera = camera;

    let detach: (() => void) | null = attachFreeControl(camera, canvas, scene);

    const applyView = (e: Vec, t: Vec): void => {
        camera.position.x = e.x;
        camera.position.y = e.y;
        camera.position.z = e.z;
        camera.target.x = t.x;
        camera.target.y = t.y;
        camera.target.z = t.z;
        const { yaw, pitch } = yawPitchFromDirection(e, t);
        camera._yaw = yaw;
        camera._pitch = pitch;
    };

    applyView(eye, target);

    return {
        camera,

        jumpTo(newEye: Vec, newTarget: Vec): void {
            // Detach and reattach the controls so any in-flight inertia from the
            // previous view is dropped and the controls start from the new view.
            if (detach) {
                detach();
                detach = null;
            }
            applyView(newEye, newTarget);
            detach = attachFreeControl(camera, canvas, scene);
        },

        dispose(): void {
            if (detach) {
                detach();
                detach = null;
            }
        },
    };
}
