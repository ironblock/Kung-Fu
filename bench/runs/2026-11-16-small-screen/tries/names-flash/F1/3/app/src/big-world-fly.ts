import { attachFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

const FAST_MULTIPLIER = 20;

// The type declarations do not expose the library's exact default keyboard
// mappings, so this list is intentionally broad for the common fly-camera
// movement keys: WASD, arrows, and the usual vertical / rise-and-sink keys.
const movementKeyCodes = new Set<string>([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Space",
  "ShiftLeft",
  "ShiftRight",
  "ControlLeft",
  "ControlRight",
  "KeyQ",
  "KeyE",
  "PageUp",
  "PageDown",
]);

const movementKeyNames = new Set<string>([
  "w",
  "a",
  "s",
  "d",
  "arrowup",
  "arrowdown",
  "arrowleft",
  "arrowright",
  " ",
  "space",
  "shift",
  "control",
  "q",
  "e",
  "pageup",
  "pagedown",
]);

function isMovementKey(event: KeyboardEvent): boolean {
  const code = event.code ?? "";
  const key = (event.key ?? "").toLowerCase();
  return movementKeyCodes.has(code) || movementKeyNames.has(key);
}

function keyboardIdentifier(event: KeyboardEvent): string {
  return event.code || event.key || "";
}

export function attachBigWorldFly(
  camera: FreeCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  const activeKeys = new Set<string>();
  let normalSpeed = camera.speed;

  function captureNormalSpeed(): void {
    if (activeKeys.size === 0) {
      normalSpeed = camera.speed;
    } else {
      normalSpeed = camera.speed / FAST_MULTIPLIER;
    }
  }

  function applyKeyboardSpeed(): void {
    camera.speed = activeKeys.size === 0 ? normalSpeed : normalSpeed * FAST_MULTIPLIER;
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (!isMovementKey(event)) return;

    const id = keyboardIdentifier(event);
    if (!id) return;

    captureNormalSpeed();
    activeKeys.add(id);
    applyKeyboardSpeed();
  }

  function onKeyUp(event: KeyboardEvent): void {
    if (!isMovementKey(event)) return;

    const id = keyboardIdentifier(event);
    if (!id || !activeKeys.has(id)) return;

    captureNormalSpeed();
    activeKeys.delete(id);
    applyKeyboardSpeed();
  }

  function onBlur(): void {
    if (activeKeys.size === 0) return;

    captureNormalSpeed();
    activeKeys.clear();
    applyKeyboardSpeed();
  }

  // Register our keyboard listeners before attaching the library's default
  // controls so that, when both listen on the canvas, our key state change
  // happens before the library's handlers.
  canvas.addEventListener("keydown", onKeyDown, true);
  canvas.addEventListener("keyup", onKeyUp, true);
  canvas.addEventListener("blur", onBlur);

  let disposeDefaultControls: () => void;

  try {
    disposeDefaultControls = attachFreeControl(camera, canvas, scene);
  } catch (error) {
    canvas.removeEventListener("keydown", onKeyDown, true);
    canvas.removeEventListener("keyup", onKeyUp, true);
    canvas.removeEventListener("blur", onBlur);

    if (activeKeys.size > 0) {
      captureNormalSpeed();
    } else {
      normalSpeed = camera.speed;
    }

    activeKeys.clear();
    applyKeyboardSpeed();

    throw error;
  }

  return function dispose(): void {
    canvas.removeEventListener("keydown", onKeyDown, true);
    canvas.removeEventListener("keyup", onKeyUp, true);
    canvas.removeEventListener("blur", onBlur);

    if (activeKeys.size > 0) {
      captureNormalSpeed();
    } else {
      normalSpeed = camera.speed;
    }

    activeKeys.clear();
    applyKeyboardSpeed();

    disposeDefaultControls();
  };
}
