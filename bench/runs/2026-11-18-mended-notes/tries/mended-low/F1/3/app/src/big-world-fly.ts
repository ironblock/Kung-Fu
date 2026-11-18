import { attachConfigurableFreeControl, type FreeCamera, type SceneContext } from "@babylonjs/lite";

export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const dispose = attachConfigurableFreeControl(camera, canvas, scene, {
        fastKeys: [
            "KeyW", "KeyA", "KeyS", "KeyD",
            "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
            "Space", "PageUp",
            "ShiftLeft", "ShiftRight", "PageDown",
        ],
        fastMultiplier: 20,
    });
    return dispose;
}
