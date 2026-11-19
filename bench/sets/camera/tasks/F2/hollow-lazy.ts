import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface Walkthrough { readonly camera: FreeCamera; jumpTo(eye: Vec, target: Vec): void; dispose(): void }

// Controls are bound to a camera, and the camera's heading is fixed when it is made, so the controls are
// attached in jumpTo to a camera made for the new view.
export function createWalkthrough(canvas: HTMLCanvasElement, scene: SceneContext, eye: Vec, target: Vec): Walkthrough {
    let camera = createFreeCamera({ ...eye }, { ...target });
    let detach: () => void = () => {};
    scene.camera = camera;
    return {
        get camera() { return camera; },
        jumpTo(e: Vec, t: Vec): void {
            detach();
            camera = createFreeCamera({ ...e }, { ...t });
            detach = attachFreeControl(camera, canvas, scene);
            scene.camera = camera;
        },
        dispose(): void { detach(); detach = () => {}; },
    };
}
