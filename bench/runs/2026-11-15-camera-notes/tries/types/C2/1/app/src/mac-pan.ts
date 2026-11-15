import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Library orbit/zoom controls with Ctrl + primary-button drag panning instead
 * of orbiting, for Mac laptops without a right button.
 *
 * How it works: the library maps mouse buttons to actions, not modifier keys.
 * So:
 *  - The main control (`orbit`) keeps the library defaults (primary = rotate,
 *    secondary = pan, wheel, pinch, inertia). It ignores Ctrl + primary presses.
 *  - On such a press, a pan-only control is attached to the same canvas and
 *    handed a fresh copy of the press. The library's own pan code then runs,
 *    so the pan matches a right-button drag. The pan-only control is detached
 *    after the button is released.
 *
 * The pan-only control has no scene, so it adds no per-frame hook. Its pan
 * glide uses the same camera inertia the main control applies each frame.
 */
export function attachOrbitWithCtrlPan(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const isCtrlPrimaryPress = (e: PointerEvent): boolean =>
        e.button === 0 && e.ctrlKey && e.pointerType !== "touch";

    // True only while we re-dispatch a copy of a Ctrl + primary press.
    let redispatching = false;
    let panDetach: (() => void) | null = null;
    let releaseTimer = 0;

    const orbitDetach = attachControl(camera, canvas, scene, {
        pointerMappings: { primaryButton: "rotate", secondaryButton: "pan" },
        shouldHandlePointerDown: (e) => !isCtrlPrimaryPress(e),
    });

    const releasePan = (): void => {
        clearTimeout(releaseTimer);
        releaseTimer = 0;
        if (panDetach) {
            const detach = panDetach;
            panDetach = null;
            detach();
        }
    };

    // Deferred so the pan control still sees its own pointerup/pointercancel
    // (its listeners may sit on the canvas, which runs before window).
    const schedulePanRelease = (): void => {
        if (panDetach && releaseTimer === 0) {
            releaseTimer = window.setTimeout(releasePan, 0);
        }
    };

    const onPointerDown = (e: PointerEvent): void => {
        if (!isCtrlPrimaryPress(e)) return;
        releasePan();

        panDetach = attachControl(camera, canvas, undefined, {
            pointerMappings: { primaryButton: "pan" },
            shouldHandlePointerDown: () => redispatching,
        });

        redispatching = true;
        try {
            canvas.dispatchEvent(
                new PointerEvent("pointerdown", {
                    bubbles: true,
                    cancelable: true,
                    composed: true,
                    pointerId: e.pointerId,
                    pointerType: e.pointerType,
                    isPrimary: e.isPrimary,
                    button: 0,
                    buttons: e.buttons,
                    clientX: e.clientX,
                    clientY: e.clientY,
                    screenX: e.screenX,
                    screenY: e.screenY,
                    width: e.width,
                    height: e.height,
                    pressure: e.pressure,
                    ctrlKey: e.ctrlKey,
                    shiftKey: e.shiftKey,
                    altKey: e.altKey,
                    metaKey: e.metaKey,
                }),
            );
        } finally {
            redispatching = false;
        }
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", schedulePanRelease);
    window.addEventListener("pointercancel", schedulePanRelease);

    return () => {
        canvas.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointerup", schedulePanRelease);
        window.removeEventListener("pointercancel", schedulePanRelease);
        releasePan();
        orbitDetach();
    };
}
