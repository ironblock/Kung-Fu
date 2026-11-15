import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/** How much faster the camera moves while either Shift key is held. */
const BOOST = 3;

/**
 * Key bindings, given as KeyboardEvent.code values so that holding Shift does
 * not change what a key means (with event.key, Shift+W would arrive as "W").
 * Shift appears in none of these lists, so it can never move the camera by
 * itself, whatever the library's default bindings are.
 */
const FLY_KEYS = {
    keysUp: ["KeyW", "ArrowUp"],
    keysDown: ["KeyS", "ArrowDown"],
    keysLeft: ["KeyA", "ArrowLeft"],
    keysRight: ["KeyD", "ArrowRight"],
    keysUpward: ["Space"],
    keysDownward: ["PageDown"],
};

/**
 * Gives `camera` the library's keyboard and mouse fly controls on `canvas`,
 * with Shift (left or right) as a 3x speed key.
 *
 * Returns a function that removes everything this added: the library's
 * listeners and per-frame hook, and our own Shift listeners. Nothing of ours
 * runs per frame; the boost is applied by changing camera.speed when Shift
 * goes down or up.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // Keys are only heard while the canvas has focus, so make it focusable.
    if (canvas.tabIndex < 0 && !canvas.hasAttribute("tabindex")) {
        canvas.tabIndex = 0;
    }

    const detachLibrary = attachConfigurableFreeControl(camera, canvas, scene, {
        keyboard: true,
        mouse: true,
        ...FLY_KEYS,
    });

    const baseSpeed = camera.speed;
    const shiftsHeld = new Set<string>();

    const applySpeed = (): void => {
        camera.speed = shiftsHeld.size > 0 ? baseSpeed * BOOST : baseSpeed;
    };

    const onKeyDown = (e: KeyboardEvent): void => {
        if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
            shiftsHeld.add(e.code);
            applySpeed();
        }
    };

    const onKeyUp = (e: KeyboardEvent): void => {
        if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
            shiftsHeld.delete(e.code);
            applySpeed();
        }
    };

    // A keyup that happens after focus has left the canvas is never seen, so
    // drop the boost when focus goes rather than leave it stuck on.
    const onBlur = (): void => {
        shiftsHeld.clear();
        applySpeed();
    };

    canvas.addEventListener("keydown", onKeyDown);
    canvas.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("blur", onBlur);

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        canvas.removeEventListener("keydown", onKeyDown);
        canvas.removeEventListener("keyup", onKeyUp);
        canvas.removeEventListener("blur", onBlur);
        detachLibrary();
        camera.speed = baseSpeed;
    };
}
