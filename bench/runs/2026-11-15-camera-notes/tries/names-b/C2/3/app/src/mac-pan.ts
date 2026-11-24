import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl } from "@babylonjs/lite";

const PRIMARY_BUTTON = 0;
const SECONDARY_BUTTON = 2;

/**
 * Attaches the library's standard orbit controls to `canvas`, and additionally
 * lets Ctrl + primary-button drag pan the camera.
 *
 * The library's controls decide the action from the pointer button, and have no
 * modifier-key option. So a Ctrl + primary press is blocked from the library's
 * pointer handling, and re-issued as a synthetic secondary-button press on the
 * canvas. The library then runs its own right-button pan path, so the pan speed,
 * inertia and glide match a right-button drag exactly.
 *
 * Returns a function that removes every listener this function added.
 */
export function attachOrbitWithCtrlPan(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    // True from a Ctrl + primary press until the pointer is released.
    // Used only to suppress the context menu that some Mac browsers open on Ctrl-click.
    let ctrlPanActive = false;

    const isCtrlPrimary = (e: PointerEvent): boolean =>
        e.button === PRIMARY_BUTTON && e.ctrlKey;

    const onPointerDownCapture = (e: PointerEvent): void => {
        // Our own synthetic press is untrusted; ignore it to avoid recursion.
        if (!e.isTrusted || !isCtrlPrimary(e)) {
            return;
        }
        ctrlPanActive = true;
        e.preventDefault();

        // The library's filter below blocks the original event. Re-issue it as a
        // secondary-button press, which the library maps to "pan".
        canvas.dispatchEvent(
            new PointerEvent("pointerdown", {
                bubbles: true,
                cancelable: true,
                composed: true,
                pointerId: e.pointerId,
                pointerType: e.pointerType,
                isPrimary: e.isPrimary,
                button: SECONDARY_BUTTON,
                buttons: SECONDARY_BUTTON,
                clientX: e.clientX,
                clientY: e.clientY,
                screenX: e.screenX,
                screenY: e.screenY,
                width: e.width,
                height: e.height,
                pressure: e.pressure,
                altKey: e.altKey,
                shiftKey: e.shiftKey,
                metaKey: e.metaKey,
                ctrlKey: false,
            }),
        );
    };

    const onContextMenuCapture = (e: Event): void => {
        if (ctrlPanActive) {
            e.preventDefault();
        }
    };

    const endCtrlPan = (): void => {
        ctrlPanActive = false;
    };

    canvas.addEventListener("pointerdown", onPointerDownCapture, true);
    canvas.addEventListener("contextmenu", onContextMenuCapture, true);
    window.addEventListener("pointerup", endCtrlPan, true);
    window.addEventListener("pointercancel", endCtrlPan, true);

    const detachLibraryControls = attachControl(camera, canvas, scene, {
        pointerMappings: {
            primaryButton: "rotate",
            secondaryButton: "pan",
        },
        // Ctrl + primary is handled by the re-issued press above, not by the library.
        shouldHandlePointerDown: (e: PointerEvent) => !isCtrlPrimary(e),
    });

    return () => {
        canvas.removeEventListener("pointerdown", onPointerDownCapture, true);
        canvas.removeEventListener("contextmenu", onContextMenuCapture, true);
        window.removeEventListener("pointerup", endCtrlPan, true);
        window.removeEventListener("pointercancel", endCtrlPan, true);
        ctrlPanActive = false;
        detachLibraryControls();
    };
}
