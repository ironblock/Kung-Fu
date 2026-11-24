import { attachConfigurableFreeControl, createBankedFreeCamera } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface Walkthrough { readonly camera: FreeCamera; jumpTo(eye: Vec, target: Vec): void; dispose(): void }

// Another right answer: a fresh banked camera and the configurable controls for each viewpoint.
export function createWalkthrough(canvas: HTMLCanvasElement, scene: SceneContext, eye: Vec, target: Vec): Walkthrough {
    const state = { camera: null as unknown as FreeCamera, detach: () => {} };
    const show = (e: Vec, t: Vec) => {
        state.detach();
        state.camera = createBankedFreeCamera({ ...e }, { ...t });
        state.detach = attachConfigurableFreeControl(state.camera, canvas, scene);
        scene.camera = state.camera;
    };
    show(eye, target);
    return {
        get camera() {
            return state.camera;
        },
        jumpTo: show,
        dispose: () => state.detach(),
    };
}
