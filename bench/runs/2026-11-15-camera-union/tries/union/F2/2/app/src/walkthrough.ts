import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
    readonly camera: FreeCamera;
    jumpTo(eye: Vec, target: Vec): void;
    dispose(): void;
}

function copyVec(v: Vec): Vec {
    return { x: v.x, y: v.y, z: v.z };
}

export function createWalkthrough(canvas: HTMLCanvasElement, scene: SceneContext, eye: Vec, target: Vec): Walkthrough {
    const camera = createFreeCamera(copyVec(eye), copyVec(target));
    scene.camera = camera;

    let detach: (() => void) | null = attachFreeControl(camera, canvas, scene);
    let disposed = false;

    return {
        camera,

        jumpTo(newEye: Vec, newTarget: Vec): void {
            // The free controls aim from camera._yaw/_pitch, not from target, and they rebuild
            // target from those on the next key move or drag. So the angles must match the new
            // view. Take them from a scratch camera built by the library itself, so we do not
            // have to know its angle convention.
            const aim = createFreeCamera(copyVec(newEye), copyVec(newTarget));
            camera._yaw = aim._yaw;
            camera._pitch = aim._pitch;

            camera.target.x = newTarget.x;
            camera.target.y = newTarget.y;
            camera.target.z = newTarget.z;
            camera.position.x = newEye.x;
            camera.position.y = newEye.y;
            camera.position.z = newEye.z;

            // Re-attach so that any turn or move velocity left over from earlier input
            // (which the controls keep in their own closure) does not carry on after the jump.
            if (detach) {
                detach();
                detach = null;
            }
            if (!disposed) {
                detach = attachFreeControl(camera, canvas, scene);
            }
        },

        dispose(): void {
            disposed = true;
            if (detach) {
                detach();
                detach = null;
            }
        },
    };
}
