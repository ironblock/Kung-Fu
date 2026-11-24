import { attachFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/** How much faster movement keys carry the camera than the library default. */
const FLY_SPEED_MULTIPLIER = 20;

/**
 * Key codes that move the camera in the library's default free-camera bindings:
 * W/A/S/D and the arrows for movement, Space/PageUp to rise, and
 * ShiftLeft/ShiftRight/PageDown to sink.
 */
const MOVEMENT_CODES: ReadonlySet<string> = new Set([
    "KeyW",
    "KeyA",
    "KeyS",
    "KeyD",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "Space",
    "PageUp",
    "ShiftLeft",
    "ShiftRight",
    "PageDown",
]);

/**
 * Attach the library's free-camera keyboard and mouse controls to `camera`, with
 * movement keys boosted by {@link FLY_SPEED_MULTIPLIER}.
 *
 * Mouse look and key bindings come unchanged from `attachFreeControl`. The boost
 * works by scaling `camera.speed` while at least one movement key is held and
 * restoring it when all are released. No per-frame hook is installed.
 *
 * @returns Cleanup that removes every listener and restores `camera.speed`.
 *   Safe to call more than once.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const detachLibraryControls = attachFreeControl(camera, canvas, scene);

    const held = new Set<string>();
    let baseSpeed = camera.speed;
    let boosted = false;

    const syncSpeed = (): void => {
        const shouldBoost = held.size > 0;
        if (shouldBoost === boosted) return;
        if (shouldBoost) {
            baseSpeed = camera.speed;
            camera.speed = baseSpeed * FLY_SPEED_MULTIPLIER;
        } else {
            camera.speed = baseSpeed;
        }
        boosted = shouldBoost;
    };

    const onKeyDown = (event: KeyboardEvent): void => {
        if (!MOVEMENT_CODES.has(event.code)) return;
        held.add(event.code);
        syncSpeed();
    };

    const onKeyUp = (event: KeyboardEvent): void => {
        if (held.delete(event.code)) syncSpeed();
    };

    // A key released while the window is unfocused never delivers keyup.
    const onBlur = (): void => {
        if (held.size === 0) return;
        held.clear();
        syncSpeed();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        window.removeEventListener("blur", onBlur);
        detachLibraryControls();
        held.clear();
        if (boosted) {
            camera.speed = baseSpeed;
            boosted = false;
        }
    };
}
