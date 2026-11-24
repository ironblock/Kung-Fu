import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// Key codes (legacy keyCode values, which the library's keyboard input uses).
const KEY_W = 87;
const KEY_A = 65;
const KEY_S = 83;
const KEY_D = 68;
const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const KEY_SPACE = 32;
const KEY_PAGE_DOWN = 34;

const SHIFT_CODES: ReadonlySet<string> = new Set(["ShiftLeft", "ShiftRight"]);
const BOOST_FACTOR = 3;

/**
 * Attaches keyboard and mouse fly controls to a free camera.
 *
 * - W/A/S/D or arrow keys: move
 * - Mouse: look around (via the library's attachControl)
 * - Space: rise, PageDown: sink
 * - Shift (left or right): speed boost only; it never moves the camera by itself
 *
 * Returns a function that removes every listener and restores the camera's
 * previous settings.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
  // Remember what we are about to change so cleanup can restore it.
  const previous = {
    speed: camera.speed,
    keysUp: camera.keysUp,
    keysDown: camera.keysDown,
    keysLeft: camera.keysLeft,
    keysRight: camera.keysRight,
    keysUpward: camera.keysUpward,
    keysDownward: camera.keysDownward,
  };
  const baseSpeed = previous.speed;

  // Movement keys. Vertical movement is bound only to Space and PageDown;
  // no Shift key code appears in any movement list.
  camera.keysUp = [KEY_W, KEY_UP];
  camera.keysDown = [KEY_S, KEY_DOWN];
  camera.keysLeft = [KEY_A, KEY_LEFT];
  camera.keysRight = [KEY_D, KEY_RIGHT];
  camera.keysUpward = [KEY_SPACE];
  camera.keysDownward = [KEY_PAGE_DOWN];

  // Track which Shift keys are physically held. Using a set means releasing
  // one Shift key while the other is still held keeps the boost on.
  const heldShift = new Set<string>();

  const applySpeed = (): void => {
    camera.speed = heldShift.size > 0 ? baseSpeed * BOOST_FACTOR : baseSpeed;
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    if (SHIFT_CODES.has(event.code)) {
      heldShift.add(event.code);
      applySpeed();
    }
  };

  const onKeyUp = (event: KeyboardEvent): void => {
    if (SHIFT_CODES.has(event.code)) {
      heldShift.delete(event.code);
      applySpeed();
    }
  };

  // If the window loses focus, key-up events may never arrive, so clear the boost.
  const onBlur = (): void => {
    heldShift.clear();
    applySpeed();
  };

  camera.attachControl(canvas);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);

  // scene is accepted to match the public signature; the controls above do not
  // need a per-frame hook, so nothing is registered with the scene.
  void scene;

  let detached = false;
  return (): void => {
    if (detached) {
      return;
    }
    detached = true;

    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("blur", onBlur);
    heldShift.clear();

    camera.detachControl();

    camera.keysUp = previous.keysUp;
    camera.keysDown = previous.keysDown;
    camera.keysLeft = previous.keysLeft;
    camera.keysRight = previous.keysRight;
    camera.keysUpward = previous.keysUpward;
    camera.keysDownward = previous.keysDownward;
    camera.speed = baseSpeed;
  };
}
