import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
    readonly camera: FreeCamera;
    jumpTo(eye: Vec, target: Vec): void;
    dispose(): void;
}

// attachFreeControl clamps _pitch to +/-(PI/2 - 0.01) on input; clamp here too so the
// first input after a jump does not snap the view.
const PITCH_LIMIT = Math.PI / 2 - 0.01;

export function createWalkthrough(canvas: HTMLCanvasElement, scene: SceneContext, eye: Vec, target: Vec): Walkthrough {
    const camera = createFreeCamera({ x: eye.x, y: eye.y, z: eye.z }, { x: target.x, y: target.y, z: target.z });
    scene.camera = camera;

    // The free controls steer from camera._yaw / _pitch and rewrite target on input, so
    // a jump has to update the stored angles as well as position and target. Position and
    // target are ObservableVec3, so their components are written in place (not replaced).
    const aim = (e: Vec, t: Vec): void => {
        camera.position.x = e.x;
        camera.position.y = e.y;
        camera.position.z = e.z;
        camera.target.x = t.x;
        camera.target.y = t.y;
        camera.target.z = t.z;

        const dx = t.x - e.x;
        const dy = t.y - e.y;
        const dz = t.z - e.z;
        // Same convention as attachFreeControl: yaw 0 looks along +Z.
        camera._yaw = Math.atan2(dx, dz);
        const horizontal = Math.hypot(dx, dz);
        camera._pitch = Math.min(PITCH_LIMIT, Math.max(-PITCH_LIMIT, Math.atan2(dy, horizontal)));
    };

    aim(eye, target);

    const detachControls = attachFreeControl(camera, canvas, scene);
    let disposed = false;

    return {
        camera,
        jumpTo(newEye: Vec, newTarget: Vec): void {
            aim(newEye, newTarget);
        },
        dispose(): void {
            if (disposed) return;
            disposed = true;
            detachControls();
        },
    };
}
