import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

type PrimaryMode = "rotate" | "pan";

/**
 * Attaches the library's standard orbit-camera controls to `canvas`, and adds
 * one change: holding Ctrl while dragging with the primary button pans the
 * camera instead of orbiting it. The pan goes through the library's own pan
 * path (the same one the secondary button uses), so its speed and inertia
 * match a right-button drag.
 *
 * Returns a function that removes every listener and per-frame hook added here.
 */
export function attachOrbitWithCtrlPan(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // Action for the primary button for the gesture currently in progress.
    // It is set on each pointerdown, before the library reads the mapping.
    let primaryMode: PrimaryMode = "rotate";

    const pointerMappings = {
        get primaryButton(): PrimaryMode {
            return primaryMode;
        },
        secondaryButton: "pan" as const,
    };

    // Capture phase on window: runs before the library's canvas listeners,
    // so the mode is set before the library handles the press.
    const onPointerDown = (event: PointerEvent): void => {
        if (event.target !== canvas) {
            return;
        }
        primaryMode = event.button === 0 && event.ctrlKey ? "pan" : "rotate";
    };

    // On macOS, Ctrl+click opens the context menu, which can swallow the drag.
    // Suppress it only when Ctrl is held, so plain right-click is unchanged.
    const onContextMenu = (event: MouseEvent): void => {
        if (event.ctrlKey) {
            event.preventDefault();
        }
    };

    window.addEventListener("pointerdown", onPointerDown, { capture: true });
    canvas.addEventListener("contextmenu", onContextMenu);

    const detachLibraryControls = attachControl(camera, canvas, scene, { pointerMappings });

    return () => {
        detachLibraryControls();
        window.removeEventListener("pointerdown", onPointerDown, { capture: true });
        canvas.removeEventListener("contextmenu", onContextMenu);
        primaryMode = "rotate";
    };
}
