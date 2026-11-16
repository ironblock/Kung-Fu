import { attachFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// Movement keys of the library's free camera (KeyboardEvent.code), per camera-notes.md note 55.
const MOVE_KEYS: ReadonlySet<string> = new Set([
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

const MOVE_MULTIPLIER = 20;
const EXTRA_MOVE = MOVE_MULTIPLIER - 1;

// Assumed shape of the scene's per-frame hook list (see camera-notes.md notes 1, 30, 41).
// Not present in the supplied type declarations; verify against the library before relying on it.
type BeforeRenderHook = (deltaMs: number) => void;
type SceneWithBeforeRender = SceneContext & { _beforeRender: BeforeRenderHook[] };

/**
 * Attaches the library's free-camera keyboard and mouse controls to `camera`, with
 * translation scaled by MOVE_MULTIPLIER. Mouse look is left entirely to the library:
 * we never change `speed`, `angularSensitivity`, or the camera's yaw/pitch.
 *
 * Translation is amplified by measuring how far the library moved `camera.position`
 * during each frame and adding (MOVE_MULTIPLIER - 1) times that displacement to both
 * position and target. Translation only comes from movement keys, so this only affects
 * key movement. Movement that starts while a key is held, or during the decay after
 * release, is amplified.
 *
 * Returns a function that removes the controls and the per-frame hook.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // Attach the library's controls first so that its per-frame hook is registered before ours.
    const detachLibrary = attachFreeControl(camera, canvas, scene);
    const hooks = (scene as SceneWithBeforeRender)._beforeRender;

    const held = new Set<string>();
    // True while library movement may still be decaying after the last movement key is released.
    let tailing = false;

    // Position as of the end of the previous frame, after our own adjustment.
    let lastX = camera.position.x;
    let lastY = camera.position.y;
    let lastZ = camera.position.z;

    const onKeyDown = (e: KeyboardEvent): void => {
        if (MOVE_KEYS.has(e.code)) {
            held.add(e.code);
        }
    };

    const onKeyUp = (e: KeyboardEvent): void => {
        if (held.delete(e.code) && held.size === 0) {
            tailing = true;
        }
    };

    const onBlur = (): void => {
        if (held.size > 0) {
            held.clear();
            tailing = true;
        }
    };

    const hook: BeforeRenderHook = () => {
        const p = camera.position;
        const dx = p.x - lastX;
        const dy = p.y - lastY;
        const dz = p.z - lastZ;

        if ((dx !== 0 || dy !== 0 || dz !== 0) && (held.size > 0 || tailing)) {
            p.x += EXTRA_MOVE * dx;
            p.y += EXTRA_MOVE * dy;
            p.z += EXTRA_MOVE * dz;

            const t = camera.target;
            t.x += EXTRA_MOVE * dx;
            t.y += EXTRA_MOVE * dy;
            t.z += EXTRA_MOVE * dz;
        }

        lastX = p.x;
        lastY = p.y;
        lastZ = p.z;

        if (held.size === 0 && tailing) {
            const step = Math.hypot(dx, dy, dz);
            if (step <= 1e-9 * Math.max(1, Math.hypot(p.x, p.y, p.z))) {
                tailing = false;
            }
        }
    };

    hooks.push(hook);
    canvas.addEventListener("keydown", onKeyDown);
    canvas.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("blur", onBlur);

    return () => {
        detachLibrary();
        canvas.removeEventListener("keydown", onKeyDown);
        canvas.removeEventListener("keyup", onKeyUp);
        canvas.removeEventListener("blur", onBlur);
        const index = hooks.indexOf(hook);
        if (index !== -1) {
            hooks.splice(index, 1);
        }
        held.clear();
        tailing = false;
    };
}
