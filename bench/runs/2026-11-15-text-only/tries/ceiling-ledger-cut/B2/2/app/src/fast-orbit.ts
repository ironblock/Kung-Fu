import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Orbit controls that turn twice as far as the library's defaults.
 *
 * How it works: the library's own controls are attached unchanged (mouse, touch,
 * wheel, inertia, pole clamp, setCameraLimits clamps). The camera's alpha/beta are
 * kept in two forms:
 *
 *   - the "library" value, which is what the library's handlers and its per-frame
 *     hook see and update, and
 *   - the "display" value = library value + an extra offset, which is what the
 *     renderer and the rest of the app see.
 *
 * Every time the library value moves during a drag (or the glide after it), the
 * extra offset grows by the same amount, so the displayed turn is exactly double.
 * The library never sees our extra offset, so its clamps never fight ours and the
 * glide it computes is its normal one (and it is doubled the same way).
 *
 * The library value is restored before the library runs and the display value put
 * back after it runs:
 *   - per frame: a hook at the head of scene._beforeRender (before the camera's hook,
 *     which attachControl pushes at the tail) and one pushed right after the
 *     camera's hook;
 *   - per DOM event: a capture listener on the canvas registered before
 *     attachControl and a listener registered after it.
 *
 * Doubling is applied only during an interaction session: from a pointerdown on the
 * canvas until all pointers are up and the camera has stopped gliding. Outside a
 * session the offset is zero and nothing is written to the camera, so programmatic
 * changes (animations, app code) are never doubled. Radius is never touched, so the
 * wheel (and pinch) zoom exactly as the library does.
 */

const TURN_FACTOR = 2;
// Our own pole guard for the displayed beta (the library keeps its own value off the
// poles; this only stops the doubled display from flipping over a pole).
const POLE_MARGIN = 0.01;
// Frames with no turn and no pointer down before a session is considered over.
const STILL_FRAMES_TO_END = 2;

const WRAPPED_EVENTS = [
    "pointerdown",
    "pointermove",
    "pointerup",
    "pointercancel",
    "pointerout",
    "pointerleave",
    "gotpointercapture",
    "lostpointercapture",
    "mousedown",
    "mousemove",
    "mouseup",
    "touchstart",
    "touchmove",
    "touchend",
    "touchcancel",
    "wheel",
    "contextmenu",
    "dblclick",
] as const;

type FrameHook = (...args: unknown[]) => void;
interface SceneInternals {
    _beforeRender: FrameHook[];
}

export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const frameList = (scene as unknown as SceneInternals)._beforeRender;

    let disposed = false;
    let sessionActive = false;
    let stillFrames = 0;
    let movedThisFrame = false;
    const pointersDown = new Set<number>();

    // Extra turn we add on top of the library's value.
    let extraAlpha = 0;
    let extraBeta = 0;
    // True while the camera holds the library value (between toLibrary and toDisplay).
    let showingLibrary = false;
    // Library value at the moment it was restored.
    let libAlphaAtRestore = 0;
    let libBetaAtRestore = 0;

    function toLibrary(): void {
        if (disposed || showingLibrary) {
            return;
        }
        showingLibrary = true;
        // Any change made to the displayed value since toDisplay (by code we do not
        // wrap) passes through linearly to the library value.
        if (extraAlpha !== 0) {
            camera.alpha = camera.alpha - extraAlpha;
        }
        if (extraBeta !== 0) {
            camera.beta = camera.beta - extraBeta;
        }
        libAlphaAtRestore = camera.alpha;
        libBetaAtRestore = camera.beta;
    }

    function toDisplay(): void {
        if (disposed || !showingLibrary) {
            return;
        }
        showingLibrary = false;
        const libAlpha = camera.alpha;
        const libBeta = camera.beta;
        const dAlpha = libAlpha - libAlphaAtRestore;
        const dBeta = libBeta - libBetaAtRestore;
        if (dAlpha !== 0 || dBeta !== 0) {
            movedThisFrame = true;
        }
        if (!sessionActive) {
            return;
        }
        extraAlpha += dAlpha * (TURN_FACTOR - 1);
        extraBeta += dBeta * (TURN_FACTOR - 1);

        if (extraAlpha !== 0) {
            camera.alpha = libAlpha + extraAlpha;
            // Absorb any clamp applied by the camera's setters (setCameraLimits).
            extraAlpha = camera.alpha - libAlpha;
        }
        if (extraBeta !== 0) {
            const wanted = Math.max(POLE_MARGIN, Math.min(Math.PI - POLE_MARGIN, libBeta + extraBeta));
            camera.beta = wanted;
            extraBeta = camera.beta - libBeta;
        }
    }

    function endSession(): void {
        // The camera keeps showing where the doubled drag left it; from here on the
        // library continues from that value.
        sessionActive = false;
        extraAlpha = 0;
        extraBeta = 0;
        stillFrames = 0;
    }

    // --- Per-frame hooks ------------------------------------------------------------
    const headHook: FrameHook = () => {
        toLibrary();
    };
    const tailHook: FrameHook = () => {
        toDisplay();
        if (disposed || !sessionActive) {
            movedThisFrame = false;
            return;
        }
        if (pointersDown.size === 0 && !movedThisFrame) {
            stillFrames++;
            if (stillFrames >= STILL_FRAMES_TO_END) {
                endSession();
            }
        } else {
            stillFrames = 0;
        }
        movedThisFrame = false;
    };

    // --- DOM listeners ----------------------------------------------------------------
    const beforeEvent = (ev: Event): void => {
        if (disposed) {
            return;
        }
        if (ev.type === "pointerdown") {
            const pe = ev as PointerEvent;
            pointersDown.add(pe.pointerId);
            sessionActive = true;
            stillFrames = 0;
        } else if (ev.type === "pointerup" || ev.type === "pointercancel") {
            pointersDown.delete((ev as PointerEvent).pointerId);
        } else if (ev.type === "pointermove") {
            const pe = ev as PointerEvent;
            if (pe.pointerType === "mouse" && pe.buttons === 0) {
                pointersDown.delete(pe.pointerId);
            }
        }
        toLibrary();
    };
    const afterEvent = (): void => {
        toDisplay();
    };
    // pointerup outside the canvas (no pointer capture) or a lost window focus would
    // otherwise leave a pointer counted as down and keep the session open.
    const windowPointerEnd = (ev: Event): void => {
        pointersDown.delete((ev as PointerEvent).pointerId);
    };
    const windowBlur = (): void => {
        pointersDown.clear();
    };

    // Registered before attachControl so they run before the library's listeners.
    for (const type of WRAPPED_EVENTS) {
        canvas.addEventListener(type, beforeEvent, { capture: true, passive: true });
    }

    const detachLibrary = attachControl(camera, canvas, scene) as unknown as (() => void) | undefined;

    // Registered after attachControl (and non-capture) so they run after the library's.
    for (const type of WRAPPED_EVENTS) {
        canvas.addEventListener(type, afterEvent, { capture: false, passive: true });
    }
    window.addEventListener("pointerup", windowPointerEnd, true);
    window.addEventListener("pointercancel", windowPointerEnd, true);
    window.addEventListener("blur", windowBlur);

    // Head hook runs before everything (including the camera hook attachControl just
    // pushed at the tail); tail hook goes right after the camera hook.
    frameList.unshift(headHook);
    frameList.push(tailHook);

    return () => {
        if (disposed) {
            return;
        }
        // Leave the camera showing the displayed (doubled) orientation.
        toDisplay();
        disposed = true;
        sessionActive = false;
        extraAlpha = 0;
        extraBeta = 0;
        pointersDown.clear();

        if (typeof detachLibrary === "function") {
            detachLibrary();
        }

        for (const type of WRAPPED_EVENTS) {
            canvas.removeEventListener(type, beforeEvent, { capture: true });
            canvas.removeEventListener(type, afterEvent, { capture: false });
        }
        window.removeEventListener("pointerup", windowPointerEnd, true);
        window.removeEventListener("pointercancel", windowPointerEnd, true);
        window.removeEventListener("blur", windowBlur);

        for (const hook of [headHook, tailHook]) {
            const i = frameList.indexOf(hook);
            if (i !== -1) {
                frameList.splice(i, 1);
            }
        }
    };
}
