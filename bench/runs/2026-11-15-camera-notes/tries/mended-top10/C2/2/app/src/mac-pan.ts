import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's orbit controls to `canvas`, and makes Ctrl + primary-button
 * drag pan the camera (as a secondary-button drag does) instead of orbiting it.
 *
 * Mechanism: a capture-phase listener on `window` runs before any library listener.
 * For a primary-button pointer that started on the canvas with Ctrl held, it rewrites
 * `button`/`buttons` on that pointer's events to the secondary-button values, so the
 * library's own pan path handles the drag. Pan sensitivity, sign, and inertia (glide)
 * are therefore the library's own. Nothing runs per frame on our side.
 *
 * Returns a function that removes every listener added here and detaches the library controls.
 */
export function attachOrbitWithCtrlPan(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    // pointerIds whose current press was started as a Ctrl + primary press.
    const remappedPointers = new Set<number>();

    const override = (e: PointerEvent, name: "button" | "buttons", value: number): void => {
        Object.defineProperty(e, name, { value, configurable: true });
    };

    const onPointerDown = (e: PointerEvent): void => {
        if (e.target !== canvas || e.button !== 0 || !e.ctrlKey) return;
        remappedPointers.add(e.pointerId);
        override(e, "button", 2);
        override(e, "buttons", 2);
    };

    const onPointerMove = (e: PointerEvent): void => {
        // A secondary-button drag reports button -1 and buttons 2 during moves.
        if (remappedPointers.has(e.pointerId)) override(e, "buttons", 2);
    };

    const onPointerEnd = (e: PointerEvent): void => {
        if (!remappedPointers.has(e.pointerId)) return;
        remappedPointers.delete(e.pointerId);
        // Matches a secondary-button release: button 2, no buttons held.
        override(e, "button", 2);
        override(e, "buttons", 0);
    };

    // On macOS, Ctrl + click opens the context menu. Suppress it on the canvas.
    const onContextMenu = (e: MouseEvent): void => {
        if (e.ctrlKey) e.preventDefault();
    };

    window.addEventListener("pointerdown", onPointerDown, { capture: true });
    window.addEventListener("pointermove", onPointerMove, { capture: true });
    window.addEventListener("pointerup", onPointerEnd, { capture: true });
    window.addEventListener("pointercancel", onPointerEnd, { capture: true });
    canvas.addEventListener("contextmenu", onContextMenu);

    const detachLibraryControls = attachControl(camera, canvas, scene, {
        pointerMappings: { primaryButton: "rotate", secondaryButton: "pan" },
    });

    return () => {
        window.removeEventListener("pointerdown", onPointerDown, { capture: true });
        window.removeEventListener("pointermove", onPointerMove, { capture: true });
        window.removeEventListener("pointerup", onPointerEnd, { capture: true });
        window.removeEventListener("pointercancel", onPointerEnd, { capture: true });
        canvas.removeEventListener("contextmenu", onContextMenu);
        remappedPointers.clear();
        detachLibraryControls();
    };
}
