// K1 hollow try 1 (plausible): the library's mouse and touch controls, and the keyboard asked for in
// attachControl, plus an own arrow-key handler "so the keys work for sure". The library's own keyboard
// control is never turned on (enableArcRotateKeyboardControls is not called), so the own handler does it all.
import { attachControl, createArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const STEP = 0.01;

export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(Math.PI / 2, Math.PI / 3, 10, { x: 0, y: 0, z: 0 });
    attachControl(camera, canvas, scene, { keyboard: true });
    const held = new Set<string>();
    canvas.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.code.startsWith("Arrow")) {
            held.add(e.code);
            e.preventDefault();
        }
    });
    canvas.addEventListener("keyup", (e: KeyboardEvent) => held.delete(e.code));
    canvas.addEventListener("blur", () => held.clear());
    if (!canvas.hasAttribute("tabindex")) canvas.tabIndex = 0;
    scene._beforeRender.push(() => {
        if (held.has("ArrowLeft")) camera.inertialAlphaOffset -= STEP;
        if (held.has("ArrowRight")) camera.inertialAlphaOffset += STEP;
        if (held.has("ArrowUp")) camera.inertialBetaOffset -= STEP;
        if (held.has("ArrowDown")) camera.inertialBetaOffset += STEP;
    });
    return camera;
}
