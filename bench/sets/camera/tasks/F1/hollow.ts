import { attachFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// Hollow: raises camera.speed 20 times only while a movement key is held, and puts it back when none is.
// The turn glide's cut-off is camera.speed * 0.001, so a drag made while no key is held turns as the
// default does, but a drag made while flying (W held) is cut short.
const MOVE = new Set(["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "PageUp", "ShiftLeft", "ShiftRight", "PageDown"]);

export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const base = camera.speed;
    const held = new Set<string>();
    const sync = () => {
        camera.speed = held.size > 0 ? base * 20 : base;
    };
    const down = (e: Event) => {
        const code = (e as KeyboardEvent).code;
        if (MOVE.has(code)) {
            held.add(code);
            sync();
        }
    };
    const up = (e: Event) => {
        held.delete((e as KeyboardEvent).code);
        sync();
    };
    canvas.addEventListener("keydown", down);
    canvas.addEventListener("keyup", up);
    const detach = attachFreeControl(camera, canvas, scene);
    return () => {
        detach();
        canvas.removeEventListener("keydown", down);
        canvas.removeEventListener("keyup", up);
        camera.speed = base;
    };
}
