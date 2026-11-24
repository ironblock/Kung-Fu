import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit-camera controls to `canvas`, and adds
 * Ctrl + primary-button drag as a pan.
 *
 * Mapping: primary button drag orbits, secondary (right) button drag pans,
 * wheel and pinch zoom, touch always orbits. A primary-button pointerdown with
 * Ctrl held makes that drag a pan; the library's own pan handling does the
 * work, so the pan amount and glide match a right-button drag.
 *
 * Returns a function that removes every listener added here and the library's
 * controls.
 */
export function attachOrbitWithCtrlPan(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    // Whether the current primary-button drag was started with Ctrl held.
    // Set on every pointerdown and cleared on pointer release, so it always
    // reflects the most recent press.
    let ctrlPanDrag = false;

    // Registered before attachControl so this runs first on the canvas, and
    // the library reads pointerMappings after this has set the flag.
    const onPointerDown = (e: PointerEvent): void => {
        ctrlPanDrag = e.button === 0 && e.ctrlKey;
    };
    const onPointerRelease = (): void => {
        ctrlPanDrag = false;
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerRelease);
    window.addEventListener("pointercancel", onPointerRelease);

    const pointerMappings = {
        get primaryButton(): "rotate" | "pan" {
            return ctrlPanDrag ? "pan" : "rotate";
        },
        secondaryButton: "pan" as const,
    };

    const detachControl = attachControl(camera, canvas, scene, { pointerMappings });

    return () => {
        detachControl();
        canvas.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointerup", onPointerRelease);
        window.removeEventListener("pointercancel", onPointerRelease);
        ctrlPanDrag = false;
    };
}
