import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface Walkthrough { readonly camera: FreeCamera; jumpTo(eye: Vec, target: Vec): void; dispose(): void }

// One camera. A jump writes the pose and the heading the controls steer by.
export function createWalkthrough(canvas: HTMLCanvasElement, scene: SceneContext, eye: Vec, target: Vec): Walkthrough {
    const camera = createFreeCamera({ ...eye }, { ...target });
    const detach = attachFreeControl(camera, canvas, scene);
    scene.camera = camera;
    return {
        camera,
        jumpTo(e: Vec, t: Vec): void {
            camera.position.set(e.x, e.y, e.z);
            camera.target.set(t.x, t.y, t.z);
            const dx = t.x - e.x, dy = t.y - e.y, dz = t.z - e.z;
            camera._yaw = Math.atan2(dx, dz);
            camera._pitch = Math.atan2(dy, Math.hypot(dx, dz));
        },
        dispose: detach,
    };
}
