import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl } from "@babylonjs/lite";

const PRIMARY_BUTTON = 0;
const SECONDARY_BUTTON = 2;

type PanPhase = "pointerdown" | "pointermove" | "pointerup" | "pointercancel";

/**
 * Library controls (orbit on primary, pan on secondary, wheel/pinch zoom) plus a
 * Ctrl+primary-drag that pans exactly as a secondary-button drag does.
 *
 * The library decides pan vs. orbit only by mouse button, so a Ctrl+primary press
 * is refused by the library (shouldHandlePointerDown) and re-issued to it as a
 * secondary-button pointer sequence. The library then runs its own pan code, so
 * sensitivity, inertia and glide are identical to a right-button drag.
 *
 * Nothing runs per frame here; the library's own update loop handles inertia.
 * The returned function removes every listener this function adds and detaches
 * the library controls.
 */
export function attachOrbitWithCtrlPan(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const detachLibrary = attachControl(camera, canvas, scene, {
        pointerMappings: { primaryButton: "rotate", secondaryButton: "pan" },
        shouldHandlePointerDown: (e: PointerEvent) => !(e.button === PRIMARY_BUTTON && e.ctrlKey),
    });

    /** pointerId of the Ctrl+primary drag currently being panned, or null. */
    let panPointerId: number | null = null;
    /** Most recent real pointer event of that drag (source for synthetic events). */
    let panSource: PointerEvent | null = null;

    /** Dispatch a synthetic secondary-button pointer event to the library's canvas listeners. */
    const reissue = (phase: PanPhase, src: PointerEvent): void => {
        const isEnd = phase === "pointerup" || phase === "pointercancel";
        canvas.dispatchEvent(
            new PointerEvent(phase, {
                bubbles: true,
                cancelable: true,
                composed: true,
                pointerId: src.pointerId,
                pointerType: src.pointerType,
                isPrimary: src.isPrimary,
                clientX: src.clientX,
                clientY: src.clientY,
                screenX: src.screenX,
                screenY: src.screenY,
                movementX: src.movementX,
                movementY: src.movementY,
                width: src.width,
                height: src.height,
                pressure: src.pressure,
                tiltX: src.tiltX,
                tiltY: src.tiltY,
                shiftKey: src.shiftKey,
                altKey: src.altKey,
                metaKey: src.metaKey,
                button: phase === "pointermove" ? -1 : SECONDARY_BUTTON,
                buttons: isEnd ? 0 : SECONDARY_BUTTON,
            }),
        );
    };

    const endPan = (phase: PanPhase, src: PointerEvent): void => {
        panPointerId = null;
        panSource = null;
        reissue(phase, src);
    };

    // Canvas: start a Ctrl+primary pan. The library ignores this press itself
    // (see shouldHandlePointerDown above), so only one pan is ever started.
    const onCanvasPointerDown = (e: PointerEvent): void => {
        if (!e.isTrusted || e.button !== PRIMARY_BUTTON || !e.ctrlKey || panPointerId !== null) {
            return;
        }
        panPointerId = e.pointerId;
        panSource = e;
        reissue("pointerdown", e);
    };

    // Window, capture phase: while a Ctrl+primary pan is active, the real moves and
    // release are swallowed before the library sees them and replaced by the
    // synthetic secondary-button versions. This avoids double-processing.
    const onWindowPointerMove = (e: PointerEvent): void => {
        if (!e.isTrusted || e.pointerId !== panPointerId) return;
        e.stopImmediatePropagation();
        panSource = e;
        reissue("pointermove", e);
    };

    const onWindowPointerUp = (e: PointerEvent): void => {
        if (!e.isTrusted || e.pointerId !== panPointerId) return;
        e.stopImmediatePropagation();
        endPan(e.type === "pointercancel" ? "pointercancel" : "pointerup", e);
    };

    // Mac: Ctrl+click opens the context menu. Suppress it for the duration of a pan.
    const onContextMenu = (e: Event): void => {
        if (panPointerId !== null) e.preventDefault();
    };

    canvas.addEventListener("pointerdown", onCanvasPointerDown);
    canvas.addEventListener("contextmenu", onContextMenu);
    window.addEventListener("pointermove", onWindowPointerMove, true);
    window.addEventListener("pointerup", onWindowPointerUp, true);
    window.addEventListener("pointercancel", onWindowPointerUp, true);

    return () => {
        canvas.removeEventListener("pointerdown", onCanvasPointerDown);
        canvas.removeEventListener("contextmenu", onContextMenu);
        window.removeEventListener("pointermove", onWindowPointerMove, true);
        window.removeEventListener("pointerup", onWindowPointerUp, true);
        window.removeEventListener("pointercancel", onWindowPointerUp, true);

        // End an in-progress pan while the library is still attached, so its drag state is cleared.
        if (panPointerId !== null && panSource !== null) {
            endPan("pointerup", panSource);
        }
        detachLibrary();
    };
}
