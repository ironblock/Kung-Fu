import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl } from "@babylonjs/lite";

// Input types the orbit controller binds for wheel and touch. The pan controller
// must not bind these as well, or zoom and pinch would be applied twice.
const ORBIT_ONLY_TYPES = new Set([
    "wheel",
    "touchstart",
    "touchmove",
    "touchend",
    "touchcancel",
    "gesturestart",
    "gesturechange",
    "gestureend",
]);

/**
 * Attaches the library's standard arc-rotate controls to `canvas`, plus Ctrl+drag panning
 * for Macs without a right button.
 *
 * - Primary drag without Ctrl: orbit (the library's default).
 * - Right-button drag, or Ctrl+drag with any button: pan (same sensitivity and glide as the right-button pan).
 * - Wheel and pinch: zoom, handled once by the orbit controller.
 *
 * The library's attachControl maps buttons statically, so Ctrl is handled by a second
 * controller that only accepts pointer-downs with Ctrl held and maps every button to pan.
 */
export function attachOrbitWithCtrlPan(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // Orbit controller: the library defaults, but ignores Ctrl pointer-downs.
    const disposeOrbit = attachControl(camera, canvas, scene, {
        pointerMappings: { primaryButton: "rotate", secondaryButton: "pan" },
        shouldHandlePointerDown: (event: PointerEvent) => !event.ctrlKey,
    });

    // Pan controller: only Ctrl pointer-downs, all mapped to pan. It must not bind wheel or
    // touch, so those are suppressed while it attaches. Keyboard is off so it isn't duplicated.
    const hadOwnAdd = Object.prototype.hasOwnProperty.call(canvas, "addEventListener");
    const originalAdd = canvas.addEventListener;
    canvas.addEventListener = function (this: HTMLCanvasElement, type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) {
        if (ORBIT_ONLY_TYPES.has(type)) return;
        originalAdd.call(this, type, listener, options);
    } as HTMLCanvasElement["addEventListener"];

    let disposePan: () => void;
    try {
        disposePan = attachControl(camera, canvas, scene, {
            pointerMappings: { primaryButton: "pan", secondaryButton: "pan" },
            keyboard: false,
            shouldHandlePointerDown: (event: PointerEvent) => event.ctrlKey,
        });
    } finally {
        if (hadOwnAdd) {
            canvas.addEventListener = originalAdd;
        } else {
            delete (canvas as Partial<HTMLCanvasElement>).addEventListener;
        }
    }

    return () => {
        disposePan();
        disposeOrbit();
    };
}
