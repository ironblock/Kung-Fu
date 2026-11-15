import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit-camera mouse and touch controls to a
 * canvas, and adds Ctrl + primary-button drag as a pan.
 *
 * The library maps pan to the secondary (right) button only, and has no way to
 * key a gesture off a modifier. So a Ctrl + primary press on the canvas is
 * intercepted before the library sees it and re-issued to the library as a
 * secondary-button drag (same coordinates, same movement). The library's own
 * pan path then does the work, so the amount of pan and the post-release glide
 * match a right-button drag exactly. The original primary press never reaches
 * the library, so it does not orbit.
 *
 * Returns a cleanup function that removes every listener this function added
 * and the library's controls (including its per-frame inertia hook). It is safe
 * to call more than once.
 */
export function attachOrbitWithCtrlPan(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const detachLibraryControls = attachControl(camera, canvas, scene, {
        pointerMappings: { primaryButton: "rotate", secondaryButton: "pan" },
    });

    // Events we create and dispatch ourselves. The capture listeners below must
    // skip them, or they would be intercepted again.
    const ours = new WeakSet<Event>();
    // Pointers currently being panned through Ctrl + primary, mapped to their
    // most recent real event (used to end the drag on cleanup).
    const panPointers = new Map<number, PointerEvent>();

    /** Dispatch a copy of `src` to the canvas, shaped like a secondary-button drag. */
    const reissue = (type: "pointerdown" | "pointermove" | "pointerup", src: PointerEvent, button: number, buttons: number) => {
        const event = new PointerEvent(type, {
            bubbles: true,
            cancelable: true,
            composed: true,
            pointerId: src.pointerId,
            pointerType: src.pointerType,
            isPrimary: src.isPrimary,
            width: src.width,
            height: src.height,
            pressure: src.pressure,
            tiltX: src.tiltX,
            tiltY: src.tiltY,
            twist: src.twist,
            clientX: src.clientX,
            clientY: src.clientY,
            screenX: src.screenX,
            screenY: src.screenY,
            movementX: src.movementX,
            movementY: src.movementY,
            button,
            buttons,
            // Mirror a plain right-button drag: no modifiers.
            ctrlKey: false,
            shiftKey: false,
            altKey: false,
            metaKey: false,
        });
        ours.add(event);
        canvas.dispatchEvent(event);
    };

    const onPointerDown = (e: PointerEvent) => {
        if (ours.has(e)) return;
        if (e.target !== canvas || e.button !== 0 || !e.ctrlKey) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        panPointers.set(e.pointerId, e);
        reissue("pointerdown", e, 2, 2);
    };

    const onPointerMove = (e: PointerEvent) => {
        if (ours.has(e) || !panPointers.has(e.pointerId)) return;
        e.stopImmediatePropagation();
        panPointers.set(e.pointerId, e);
        // Real moves during a right-button drag report button -1 and buttons 2.
        reissue("pointermove", e, -1, 2);
    };

    const onPointerEnd = (e: PointerEvent) => {
        if (ours.has(e) || !panPointers.has(e.pointerId)) return;
        e.stopImmediatePropagation();
        panPointers.delete(e.pointerId);
        reissue("pointerup", e, 2, 0);
    };

    const captureOpts: AddEventListenerOptions = { capture: true };
    // Capture on window runs before any listener on the canvas, so the
    // library never sees the Ctrl + primary events that we replace.
    window.addEventListener("pointerdown", onPointerDown, captureOpts);
    window.addEventListener("pointermove", onPointerMove, captureOpts);
    window.addEventListener("pointerup", onPointerEnd, captureOpts);
    window.addEventListener("pointercancel", onPointerEnd, captureOpts);

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        window.removeEventListener("pointerdown", onPointerDown, captureOpts);
        window.removeEventListener("pointermove", onPointerMove, captureOpts);
        window.removeEventListener("pointerup", onPointerEnd, captureOpts);
        window.removeEventListener("pointercancel", onPointerEnd, captureOpts);

        // End any Ctrl-pan still in progress so the library is not left mid-drag.
        for (const [, last] of panPointers) {
            reissue("pointerup", last, 2, 0);
        }
        panPointers.clear();

        detachLibraryControls();
    };
}
