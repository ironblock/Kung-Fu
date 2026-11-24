import { attachFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/** How much faster the camera moves while Shift is held. */
const BOOST = 3;

function isShift(e: KeyboardEvent): boolean {
    return e.key === "Shift" || e.code === "ShiftLeft" || e.code === "ShiftRight";
}

/**
 * Gives `camera` the library's keyboard and mouse fly controls on `canvas`
 * (W/A/S/D or arrows to move, mouse to look, Space up, PageDown down) and
 * makes it move BOOST times as fast while either Shift key is held.
 *
 * Shift is a speed key only. Its own key events are kept away from the
 * library's listeners, so whatever the library would do with Shift it never
 * sees it, and Shift alone produces no movement. The boost is applied by a
 * per-frame hook that runs after the library's movement hook and scales the
 * position change the library made this frame, so it boosts exactly the
 * movement the library produces and nothing else.
 *
 * Returns a function that removes the library controls, our key listeners
 * and our per-frame hook.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    let shiftLeft = false;
    let shiftRight = false;
    const boosting = (): boolean => shiftLeft || shiftRight;

    // Registered on window in the capture phase before the library attaches,
    // so it runs ahead of any key listener the library puts on the canvas or
    // on window. Shift events aimed at the canvas stop here; everything else
    // passes through untouched.
    const onKey = (e: Event): void => {
        const ke = e as KeyboardEvent;
        if (!isShift(ke)) {
            // Resync in case a Shift keyup was missed.
            if (!ke.shiftKey) shiftLeft = shiftRight = false;
            return;
        }
        const down = ke.type === "keydown";
        if (ke.code === "ShiftRight") shiftRight = down;
        else if (ke.code === "ShiftLeft") shiftLeft = down;
        else shiftLeft = down; // key === "Shift" with no usable code

        const target = ke.target as Node | null;
        if (target === canvas || (target !== null && canvas.contains(target))) {
            ke.stopImmediatePropagation();
        }
    };
    const onBlur = (): void => {
        shiftLeft = shiftRight = false;
    };

    window.addEventListener("keydown", onKey, true);
    window.addEventListener("keyup", onKey, true);
    window.addEventListener("blur", onBlur);
    canvas.addEventListener("blur", onBlur);

    const detachLibrary = attachFreeControl(camera, canvas, scene);

    // Per-frame boost. Pushed onto the end of the scene's per-frame list after
    // the library's hook, so it runs after the library has moved the camera
    // this frame (onBeforeRender would put it at the head, before the move).
    const pos = camera.position;
    let lastX = pos.x;
    let lastY = pos.y;
    let lastZ = pos.z;
    const boostHook = (): void => {
        const x = pos.x;
        const y = pos.y;
        const z = pos.z;
        if (boosting()) {
            const extra = BOOST - 1;
            const dx = (x - lastX) * extra;
            const dy = (y - lastY) * extra;
            const dz = (z - lastZ) * extra;
            if (dx !== 0) pos.x = x + dx;
            if (dy !== 0) pos.y = y + dy;
            if (dz !== 0) pos.z = z + dz;
        }
        lastX = pos.x;
        lastY = pos.y;
        lastZ = pos.z;
    };
    const frameList = (scene as unknown as { _beforeRender: Array<(...args: unknown[]) => void> })._beforeRender;
    frameList.push(boostHook);

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        const i = frameList.indexOf(boostHook);
        if (i !== -1) frameList.splice(i, 1);
        detachLibrary();
        window.removeEventListener("keydown", onKey, true);
        window.removeEventListener("keyup", onKey, true);
        window.removeEventListener("blur", onBlur);
        canvas.removeEventListener("blur", onBlur);
    };
}
