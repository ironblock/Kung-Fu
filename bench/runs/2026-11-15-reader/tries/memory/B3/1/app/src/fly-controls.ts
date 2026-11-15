import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// Self-contained fly controls. They only read and write the camera's
// position (x/y/z) and rotation (x = pitch, y = yaw), and drive themselves
// with requestAnimationFrame, so nothing from the library's control API is
// required. See the notes in the hand-off message.

const BASE_SPEED = 5; // world units per second
const BOOST_FACTOR = 3; // applied while Shift (left or right) is held
const LOOK_SENSITIVITY = 0.005; // radians per pixel of mouse drag
const PITCH_LIMIT = Math.PI / 2 - 0.01;
const MAX_FRAME_SECONDS = 0.1; // clamp large gaps (tab switch, breakpoints)

// Keys are matched on event.code (physical key), so Shift does not change
// them and layout differences do not matter.
const FORWARD_CODES = ["KeyW", "ArrowUp"];
const BACK_CODES = ["KeyS", "ArrowDown"];
const LEFT_CODES = ["KeyA", "ArrowLeft"];
const RIGHT_CODES = ["KeyD", "ArrowRight"];
const RISE_CODES = ["Space"];
const SINK_CODES = ["PageDown"];
const SHIFT_CODES = ["ShiftLeft", "ShiftRight"];

const HANDLED_CODES = new Set<string>([
  ...FORWARD_CODES,
  ...BACK_CODES,
  ...LEFT_CODES,
  ...RIGHT_CODES,
  ...RISE_CODES,
  ...SINK_CODES,
]);

export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
  void scene; // not needed by this implementation; kept to match the public signature

  const down = new Set<string>();
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let frameId = 0;
  let lastTime = performance.now();
  let disposed = false;

  const anyDown = (codes: readonly string[]): boolean => codes.some((c) => down.has(c));

  const onKeyDown = (e: KeyboardEvent): void => {
    down.add(e.code);
    if (HANDLED_CODES.has(e.code)) {
      e.preventDefault(); // stop arrows/space/PageDown from scrolling the page
    }
  };

  const onKeyUp = (e: KeyboardEvent): void => {
    down.delete(e.code);
  };

  // If the window loses focus the browser may swallow keyup events,
  // which would leave keys stuck down. Drop all key state instead.
  const onBlur = (): void => {
    down.clear();
    dragging = false;
  };

  const onMouseDown = (e: MouseEvent): void => {
    if (e.button !== 0) return;
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  };

  // Listen on window so a drag that leaves the canvas keeps looking.
  const onMouseMove = (e: MouseEvent): void => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    camera.rotation.y += dx * LOOK_SENSITIVITY;
    camera.rotation.x = clamp(camera.rotation.x + dy * LOOK_SENSITIVITY, -PITCH_LIMIT, PITCH_LIMIT);
  };

  const onMouseUp = (): void => {
    dragging = false;
  };

  const update = (dt: number): void => {
    // Signed inputs: f = forward, r = right, u = up (world Y).
    let f = 0;
    let r = 0;
    let u = 0;
    if (anyDown(FORWARD_CODES)) f += 1;
    if (anyDown(BACK_CODES)) f -= 1;
    if (anyDown(RIGHT_CODES)) r += 1;
    if (anyDown(LEFT_CODES)) r -= 1;
    if (anyDown(RISE_CODES)) u += 1;
    if (anyDown(SINK_CODES)) u -= 1;

    const magnitude = Math.hypot(f, r, u);
    if (magnitude === 0) return;

    // Shift is a speed multiplier only. It is never read as a direction.
    const boost = anyDown(SHIFT_CODES) ? BOOST_FACTOR : 1;
    const step = (BASE_SPEED * boost * dt) / magnitude;

    // Left-handed basis matching a FreeCamera with rotation.y = yaw and
    // rotation.x = pitch (positive pitch looks down).
    const yaw = camera.rotation.y;
    const pitch = camera.rotation.x;
    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);

    // Forward follows the look direction (fly), right is horizontal.
    const fwdX = sinY * cosP;
    const fwdY = -sinP;
    const fwdZ = cosY * cosP;
    const rightX = cosY;
    const rightZ = -sinY;

    camera.position.x += (fwdX * f + rightX * r) * step;
    camera.position.y += (fwdY * f + u) * step;
    camera.position.z += (fwdZ * f + rightZ * r) * step;
  };

  const tick = (now: number): void => {
    if (disposed) return;
    const dt = Math.min((now - lastTime) / 1000, MAX_FRAME_SECONDS);
    lastTime = now;
    update(dt);
    frameId = requestAnimationFrame(tick);
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
  canvas.addEventListener("mousedown", onMouseDown);
  frameId = requestAnimationFrame(tick);

  return () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frameId);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("blur", onBlur);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
    canvas.removeEventListener("mousedown", onMouseDown);
    down.clear();
    dragging = false;
  };
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}
