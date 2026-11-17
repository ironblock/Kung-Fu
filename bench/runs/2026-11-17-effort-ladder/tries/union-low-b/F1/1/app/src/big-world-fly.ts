import type { FreeCamera, SceneContext } from "@babylonjs/lite";

export function attachBigWorldFly(
  camera: FreeCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  const FACTOR = 20;

  const origSpeed = camera.speed;
  const angSens = camera.angularSensitivity;
  const inertia = camera.inertia;
  const lookThreshold = origSpeed * 0.001;

  // --- Keyboard state ---
  const held = new Set<string>();

  // Keyboard movement velocity (persists across frames, decays by inertia)
  let mvx = 0;
  let mvy = 0;
  let mvz = 0;

  // --- Mouse look state ---
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let yawVel = 0;
  let pitchVel = 0;

  // --- Keyboard handlers ---
  function onKeyDown(e: KeyboardEvent): void {
    held.add(e.code);
    e.preventDefault();
  }

  function onKeyUp(e: KeyboardEvent): void {
    held.delete(e.code);
  }

  function onBlur(): void {
    held.clear();
  }

  // --- Mouse handlers ---
  function onPointerDown(e: PointerEvent): void {
    if (e.button === 0 || e.button === 1 || e.button === 2) {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    }
  }

  function onPointerMove(e: PointerEvent): void {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    yawVel += dx / angSens;
    pitchVel -= dy / angSens;
  }

  function onPointerUp(e: PointerEvent): void {
    dragging = false;
    if (canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
  }

  function onPointerCancel(e: PointerEvent): void {
    dragging = false;
    if (canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
  }

  // --- Per-frame update ---
  let lastTime = performance.now();
  let rafId = 0;

  function frame(): void {
    const now = performance.now();
    const dt = Math.max(now - lastTime, 1);
    lastTime = now;

    // Keyboard movement at 20× the default rate
    const accel = FACTOR * origSpeed * dt / Math.sqrt(100000);

    const yaw = camera._yaw;
    const pitch = camera._pitch;

    // Forward direction (includes pitch)
    const fx = Math.sin(yaw) * Math.cos(pitch);
    const fy = Math.sin(pitch);
    const fz = Math.cos(yaw) * Math.cos(pitch);

    // Right direction (horizontal)
    const rx = Math.cos(yaw);
    const rz = -Math.sin(yaw);

    let ax = 0;
    let ay = 0;
    let az = 0;

    if (held.has("KeyW") || held.has("ArrowUp")) {
      ax += fx * accel;
      ay += fy * accel;
      az += fz * accel;
    }
    if (held.has("KeyS") || held.has("ArrowDown")) {
      ax -= fx * accel;
      ay -= fy * accel;
      az -= fz * accel;
    }
    if (held.has("KeyA") || held.has("ArrowLeft")) {
      ax -= rx * accel;
      az -= rz * accel;
    }
    if (held.has("KeyD") || held.has("ArrowRight")) {
      ax += rx * accel;
      az += rz * accel;
    }
    if (held.has("Space") || held.has("PageUp")) {
      ay += accel;
    }
    if (held.has("ShiftLeft") || held.has("ShiftRight") || held.has("PageDown")) {
      ay -= accel;
    }

    if (ax !== 0 || ay !== 0 || az !== 0) {
      mvx += ax;
      mvy += ay;
      mvz += az;
    }

    if (mvx !== 0 || mvy !== 0 || mvz !== 0) {
      camera.position.x += mvx;
      camera.position.y += mvy;
      camera.position.z += mvz;
      camera.target.x += mvx;
      camera.target.y += mvy;
      camera.target.z += mvz;
      mvx *= inertia;
      mvy *= inertia;
      mvz *= inertia;
      if (Math.abs(mvx) < 1e-10) mvx = 0;
      if (Math.abs(mvy) < 1e-10) mvy = 0;
      if (Math.abs(mvz) < 1e-10) mvz = 0;
    }

    // Mouse look (identical to library default)
    if (yawVel !== 0 || pitchVel !== 0) {
      camera._yaw += yawVel;
      camera._pitch += pitchVel;

      // Clamp pitch to ±(PI/2 - 0.01)
      const maxP = Math.PI / 2 - 0.01;
      if (camera._pitch > maxP) camera._pitch = maxP;
      if (camera._pitch < -maxP) camera._pitch = -maxP;

      // Rebuild target 1 unit ahead
      const px = camera.position.x;
      const py = camera.position.y;
      const pz = camera.position.z;
      camera.target.x = px + Math.sin(camera._yaw) * Math.cos(camera._pitch);
      camera.target.y = py + Math.sin(camera._pitch);
      camera.target.z = pz + Math.cos(camera._yaw) * Math.cos(camera._pitch);

      // Decay
      yawVel *= inertia;
      pitchVel *= inertia;

      // Stop when below the original-speed threshold
      if (Math.abs(yawVel) < lookThreshold) yawVel = 0;
      if (Math.abs(pitchVel) < lookThreshold) pitchVel = 0;
    }

    rafId = requestAnimationFrame(frame);
  }

  // --- Setup ---
  if (!canvas.hasAttribute("tabindex")) {
    canvas.setAttribute("tabindex", "0");
  }
  canvas.addEventListener("keydown", onKeyDown);
  canvas.addEventListener("keyup", onKeyUp);
  canvas.addEventListener("blur", onBlur);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerCancel);

  rafId = requestAnimationFrame(frame);

  // --- Cleanup ---
  return (): void => {
    canvas.removeEventListener("keydown", onKeyDown);
    canvas.removeEventListener("keyup", onKeyUp);
    canvas.removeEventListener("blur", onBlur);
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("pointercancel", onPointerCancel);
    cancelAnimationFrame(rafId);
  };
}
