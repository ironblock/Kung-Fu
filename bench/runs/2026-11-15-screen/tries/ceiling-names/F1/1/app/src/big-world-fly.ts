import { attachFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/** How many times the library's default distance each movement key covers. */
const MOVE_MULTIPLIER = 20;

const KEY_EVENTS = ["keydown", "keyup"] as const;
// Forwarded too, so the key-only copies let go of held keys whenever the real controls do.
const FOCUS_EVENTS = ["blur", "focusout"] as const;

/**
 * Attaches the library's free-camera fly controls (keyboard and mouse) to `canvas`,
 * with every movement key moving the camera MOVE_MULTIPLIER times as far as the
 * default controls do. Mouse look is left as the library default.
 * Returns a function that removes the controls.
 *
 * `camera.speed` is deliberately left alone. In Babylon.js, a camera's speed also
 * sets the cutoff below which leftover mouse-look inertia is zeroed
 * (`speed * Epsilon`), so a 20x speed would make every drag turn the camera less.
 * Instead, the library's own default movement runs MOVE_MULTIPLIER times: the real
 * controls on `canvas`, plus extra copies on detached canvases that only receive the
 * keyboard and blur events that reach `canvas`. Pointer input reaches only the real
 * copy, so mouse look is unchanged. Every key the library moves with, including
 * rise and sink, is multiplied without us having to know which keys those are.
 *
 * The extra canvases must stay out of the document. Otherwise a forwarded event
 * would bubble up to `window` and be counted again by any window-level listeners.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const keyOnlyCanvases: HTMLCanvasElement[] = [];
    const detachControls: Array<() => void> = [];

    const forwardKey = (event: KeyboardEvent): void => {
        for (const target of keyOnlyCanvases) {
            target.dispatchEvent(new KeyboardEvent(event.type, event));
        }
    };
    const forwardFocus = (event: FocusEvent): void => {
        for (const target of keyOnlyCanvases) {
            target.dispatchEvent(new FocusEvent(event.type, event));
        }
    };

    // Capture phase: the forwarders still run if the library's own canvas listener
    // stops propagation.
    for (const type of KEY_EVENTS) canvas.addEventListener(type, forwardKey, true);
    for (const type of FOCUS_EVENTS) canvas.addEventListener(type, forwardFocus, true);

    let disposed = false;
    const dispose = (): void => {
        if (disposed) return;
        disposed = true;
        for (const type of KEY_EVENTS) canvas.removeEventListener(type, forwardKey, true);
        for (const type of FOCUS_EVENTS) canvas.removeEventListener(type, forwardFocus, true);
        keyOnlyCanvases.length = 0;
        // Each library detach removes that copy's listeners and its per-frame update.
        for (const detach of detachControls.splice(0).reverse()) detach();
    };

    try {
        for (let i = 1; i < MOVE_MULTIPLIER; i++) {
            const keyOnly = canvas.ownerDocument.createElement("canvas");
            detachControls.push(attachFreeControl(camera, keyOnly, scene));
            keyOnlyCanvases.push(keyOnly);
        }
        // The real controls are attached last. If the library only allowed one set of
        // controls per camera, the real one would win, leaving plain default controls
        // instead of losing mouse look.
        detachControls.push(attachFreeControl(camera, canvas, scene));
    } catch (error) {
        dispose();
        throw error;
    }

    return dispose;
}
