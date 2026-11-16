import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl } from "@babylonjs/lite";

const FLY_SPEED_MULTIPLIER = 20;

/**
 * Attaches the library's free-camera fly controls to `canvas`, with keyboard
 * movement scaled up by FLY_SPEED_MULTIPLIER while any key is held.
 *
 * Mouse look is left to the library unchanged: it is driven by
 * angularSensitivity, not by speed, so scaling speed does not touch it.
 *
 * Nothing runs per frame. The only extra state is a set of held key codes
 * and the saved base speed; both are cleared by the returned function.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const detachLibraryControls = attachFreeControl(camera, canvas, scene);

    // Keys currently held. Speed is boosted while this set is non-empty.
    // The library's rise/sink and movement key lists are not known here, so
    // any held key counts; keys that do not move the camera have no effect.
    const heldKeys = new Set<string>();
    let baseSpeed: number | null = null;

    const boost = (): void => {
        if (baseSpeed === null) {
            baseSpeed = camera.speed;
            camera.speed = baseSpeed * FLY_SPEED_MULTIPLIER;
        }
    };

    const unboost = (): void => {
        if (baseSpeed !== null) {
            camera.speed = baseSpeed;
            baseSpeed = null;
        }
    };

    const onKeyDown = (event: KeyboardEvent): void => {
        heldKeys.add(event.code);
        boost();
    };

    const onKeyUp = (event: KeyboardEvent): void => {
        heldKeys.delete(event.code);
        if (heldKeys.size === 0) {
            unboost();
        }
    };

    // Keyup can be missed when the window loses focus; drop all held state then.
    const onBlur = (): void => {
        heldKeys.clear();
        unboost();
    };

    // Window rather than canvas: keydown bubbles to window whenever the canvas
    // has focus, and this also catches the blur case.
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    return () => {
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        window.removeEventListener("blur", onBlur);
        heldKeys.clear();
        unboost();
        detachLibraryControls();
    };
}
