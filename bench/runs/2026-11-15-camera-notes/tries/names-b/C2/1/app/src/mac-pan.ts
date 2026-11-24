import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl } from "@babylonjs/lite";

/** Primary button with Ctrl held (the Mac laptop stand-in for a right-button drag). */
function isCtrlPrimary(event: PointerEvent): boolean {
    return event.button === 0 && event.ctrlKey;
}

/**
 * A view of the canvas that only forwards pointer listeners. A second
 * attachControl instance on the same camera would otherwise also handle wheel
 * and touch input, which would make zoom and pinch apply twice.
 */
function pointerOnlyView(canvas: HTMLCanvasElement): HTMLCanvasElement {
    return new Proxy(canvas, {
        get(target, prop) {
            if (prop === "addEventListener") {
                return (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => {
                    if (type.startsWith("pointer") || type === "lostpointercapture") {
                        target.addEventListener(type, listener, options);
                    }
                };
            }
            const value: unknown = Reflect.get(target, prop, target);
            return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(target) : value;
        },
    }) as HTMLCanvasElement;
}

/**
 * Attaches the library's standard arc-rotate controls to the camera, with one
 * change: Ctrl + primary-button drag pans instead of orbiting. Wheel, pinch,
 * right-button pan and plain primary-button orbit all use the library's own
 * handling. Returns a function that removes every listener this adds.
 */
export function attachOrbitWithCtrlPan(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // Standard controls (primary = orbit, secondary = pan), minus Ctrl + primary.
    const detachOrbit = attachControl(camera, canvas, scene, {
        pointerMappings: { primaryButton: "rotate", secondaryButton: "pan" },
        shouldHandlePointerDown: (event: PointerEvent) => !isCtrlPrimary(event),
    });

    // Ctrl + primary pans. Only pointer input is forwarded, so wheel and touch
    // stay with the first controller. Keyboard is off here to avoid a duplicate.
    const detachPan = attachControl(camera, pointerOnlyView(canvas), scene, {
        pointerMappings: { primaryButton: "pan", secondaryButton: "pan" },
        keyboard: false,
        shouldHandlePointerDown: isCtrlPrimary,
    });

    // On macOS, Ctrl + click opens the browser context menu, so block it on the canvas.
    const suppressContextMenu = (event: Event): void => event.preventDefault();
    canvas.addEventListener("contextmenu", suppressContextMenu);

    return () => {
        detachPan();
        detachOrbit();
        canvas.removeEventListener("contextmenu", suppressContextMenu);
    };
}
