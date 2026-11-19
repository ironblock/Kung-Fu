// Hollow: the library's mouse and touch controls, and a bare keydown handler of its own that writes
// alpha. The library's own keyboard control is never turned on (enableArcRotateKeyboardControls is not called).
import { attachControl, createArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(Math.PI / 2, Math.PI / 3, 10, { x: 0, y: 0, z: 0 });
    attachControl(camera, canvas, scene, { keyboard: true });
    canvas.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.code === "ArrowLeft") camera.alpha -= 0.05;
        if (e.code === "ArrowRight") camera.alpha += 0.05;
        if (e.code === "ArrowUp") camera.beta -= 0.05;
        if (e.code === "ArrowDown") camera.beta += 0.05;
    });
    return camera;
}
