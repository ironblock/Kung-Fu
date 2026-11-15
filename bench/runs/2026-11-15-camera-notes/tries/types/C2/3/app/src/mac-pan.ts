import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

type ControlOptions = NonNullable<Parameters<typeof attachControl>[3]>;

/** Default library behaviour: primary drag orbits, right drag pans. */
const ORBIT_OPTIONS: ControlOptions = {
    pointerMappings: { primaryButton: "rotate", secondaryButton: "pan" },
};

/** Ctrl held: primary drag pans (same library pan path as a right-button drag). */
const PAN_OPTIONS: ControlOptions = {
    pointerMappings: { primaryButton: "pan", secondaryButton: "pan" },
};

/**
 * Attach the library's orbit camera controls to `canvas`, with Ctrl + primary-button
 * drag panning instead of orbiting.
 *
 * Only one `attachControl` instance is attached at a time: the orbit configuration,
 * or the pan configuration while Ctrl is held. Switching detaches the old instance
 * (removing its canvas listeners and its per-frame inertia hook) and attaches the
 * new one. Camera inertia offsets live on the camera, so any glide still in progress
 * keeps decaying through the newly attached instance's per-frame hook.
 *
 * Returns a cleanup function that removes every listener and the active controls.
 * Safe to call more than once.
 */
export function attachOrbitWithCtrlPan(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    let detachCurrent: (() => void) | null = null;
    let panMode = false;
    let disposed = false;

    const setPanMode = (wantPan: boolean): void => {
        if (disposed) return;
        if (detachCurrent !== null && wantPan === panMode) return;
        detachCurrent?.();
        detachCurrent = attachControl(camera, canvas, scene, wantPan ? PAN_OPTIONS : ORBIT_OPTIONS);
        panMode = wantPan;
    };

    // Keep the mode in step with the Ctrl key. keydown/keyup carry the modifier state.
    const onKey = (event: KeyboardEvent): void => setPanMode(event.ctrlKey);
    const onBlur = (): void => setPanMode(false);

    // Self-heal: if a pointer-down arrives with a Ctrl state that disagrees with the
    // current mode (for example, a missed keyup), switch before the next gesture.
    // This is a capture listener, so it runs ahead of the library's own canvas listener.
    const onPointerDown = (event: PointerEvent): void => setPanMode(event.ctrlKey);

    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    window.addEventListener("blur", onBlur);
    canvas.addEventListener("pointerdown", onPointerDown, true);

    setPanMode(false);

    return () => {
        if (disposed) return;
        disposed = true;
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("keyup", onKey);
        window.removeEventListener("blur", onBlur);
        canvas.removeEventListener("pointerdown", onPointerDown, true);
        detachCurrent?.();
        detachCurrent = null;
    };
}
