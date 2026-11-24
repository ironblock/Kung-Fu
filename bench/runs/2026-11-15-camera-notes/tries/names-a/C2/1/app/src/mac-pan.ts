import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard arc-rotate controls to `canvas`, but makes
 * Ctrl + primary-button drag pan the camera instead of orbiting it.
 *
 * Pan and rotate are both handled by the library's own `attachControl`, so
 * panning, inertia, wheel zoom and pinch behave exactly as they do for the
 * right-button defaults. The primary button's action is chosen per press:
 * a press with Ctrl held maps to "pan", any other press maps to "rotate".
 *
 * Returns a function that removes every listener this installs.
 */
export function attachOrbitWithCtrlPan(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    // Ctrl state captured at the most recent pointer-down. The library reads the
    // primary-button mapping through the getter below, so this decides the action
    // for that press and any drag that follows it.
    let ctrlHeldOnPress = false;

    // Window capture phase runs before any canvas listener, including the library's.
    const onPointerDown = (event: PointerEvent): void => {
        ctrlHeldOnPress = event.ctrlKey;
    };
    window.addEventListener("pointerdown", onPointerDown, { capture: true });

    const detachControl = attachControl(camera, canvas, scene, {
        pointerMappings: {
            get primaryButton(): "pan" | "rotate" {
                return ctrlHeldOnPress ? "pan" : "rotate";
            },
            secondaryButton: "pan",
        },
    });

    return (): void => {
        window.removeEventListener("pointerdown", onPointerDown, { capture: true });
        detachControl();
    };
}
