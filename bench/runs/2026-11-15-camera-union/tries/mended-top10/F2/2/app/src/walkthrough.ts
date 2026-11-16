import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
    readonly camera: FreeCamera;
    jumpTo(eye: Vec, target: Vec): void;
    dispose(): void;
}

export function createWalkthrough(canvas: HTMLCanvasElement, scene: SceneContext, eye: Vec, target: Vec): Walkthrough {
    const camera = createFreeCamera({ x: eye.x, y: eye.y, z: eye.z }, { x: target.x, y: target.y, z: target.z });
    scene.camera = camera;

    // attachFreeControl aims from _yaw/_pitch, not from target (a hand-set target is replaced on the
    // next key move or drag). So after moving the camera we take yaw/pitch from a freshly created
    // camera at the same eye and target, letting the library compute them.
    const aimAt = (e: Vec, t: Vec): void => {
        const aim = createFreeCamera({ x: e.x, y: e.y, z: e.z }, { x: t.x, y: t.y, z: t.z });
        camera._yaw = aim._yaw;
        camera._pitch = aim._pitch;
        camera.position.x = e.x;
        camera.position.y = e.y;
        camera.position.z = e.z;
        camera.target.x = t.x;
        camera.target.y = t.y;
        camera.target.z = t.z;
    };

    let detach: (() => void) | null = attachFreeControl(camera, canvas, scene);

    return {
        camera,
        jumpTo(newEye: Vec, newTarget: Vec): void {
            aimAt(newEye, newTarget);
        },
        dispose(): void {
            if (detach) {
                detach();
                detach = null;
            }
        },
    };
}
