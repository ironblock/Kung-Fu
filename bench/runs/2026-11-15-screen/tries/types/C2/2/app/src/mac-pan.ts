import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls to `camera`, plus Ctrl+drag
 * panning for mice without a right button.
 *
 * The library maps buttons, not modifier keys, so a Ctrl+primary-button press
 * is re-issued to the camera as a secondary-button (right-button) gesture.
 * That keeps the pan path, sensitivity and glide identical to a right-drag.
 *
 * Mechanism: window capture-phase listeners see each Ctrl+primary pointer
 * event first. They stop the original event and dispatch an equivalent
 * synthetic event with `button: 2` on the canvas. The camera's own listeners
 * then handle it as a right-button drag. Events for the same pointer are
 * converted until pointerup/pointercancel. Touch input is never converted.
 *
 * Returns a cleanup function that removes every listener this function added,
 * including those attached by `attachControl`. It is safe to call more than once.
 */
export function attachOrbitWithCtrlPan(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  // Pointer currently being converted from Ctrl+primary to secondary, if any.
  let activePointerId: number | null = null;
  // Most recent original event of the converted pointer, used for synthetic cancel.
  let lastSource: PointerEvent | null = null;
  // True while we dispatch our own events, so our listeners ignore them.
  let synthesizing = false;

  const emitAsSecondary = (type: string, src: PointerEvent): void => {
    const buttonHeld = type === "pointerdown" || type === "pointermove";
    const init: PointerEventInit = {
      bubbles: true,
      cancelable: true,
      composed: true,
      pointerId: src.pointerId,
      pointerType: src.pointerType,
      isPrimary: src.isPrimary,
      clientX: src.clientX,
      clientY: src.clientY,
      screenX: src.screenX,
      screenY: src.screenY,
      movementX: src.movementX,
      movementY: src.movementY,
      width: src.width,
      height: src.height,
      pressure: src.pressure,
      tiltX: src.tiltX,
      tiltY: src.tiltY,
      button: 2,
      buttons: buttonHeld ? 2 : 0,
      shiftKey: src.shiftKey,
      altKey: src.altKey,
      metaKey: src.metaKey,
      ctrlKey: false,
    };
    synthesizing = true;
    try {
      canvas.dispatchEvent(new PointerEvent(type, init));
    } finally {
      synthesizing = false;
    }
  };

  const onPointerDown = (e: PointerEvent): void => {
    if (synthesizing || activePointerId !== null) return;
    if (e.target !== canvas || e.button !== 0 || !e.ctrlKey || e.pointerType === "touch") return;
    e.preventDefault();
    e.stopImmediatePropagation();
    activePointerId = e.pointerId;
    lastSource = e;
    emitAsSecondary("pointerdown", e);
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (synthesizing || activePointerId === null || e.pointerId !== activePointerId) return;
    e.stopImmediatePropagation();
    lastSource = e;
    emitAsSecondary("pointermove", e);
  };

  const onPointerEnd = (e: PointerEvent): void => {
    if (synthesizing || activePointerId === null || e.pointerId !== activePointerId) return;
    e.stopImmediatePropagation();
    activePointerId = null;
    emitAsSecondary(e.type, e);
    lastSource = null;
  };

  // Window lost focus mid-drag: end the converted drag so the camera isn't left dragging.
  const onBlur = (): void => {
    if (activePointerId === null || lastSource === null) return;
    activePointerId = null;
    emitAsSecondary("pointercancel", lastSource);
    lastSource = null;
  };

  // macOS shows a context menu on Ctrl+click; suppress it on the canvas.
  const onContextMenu = (e: Event): void => {
    if (e.target === canvas && (activePointerId !== null || (e as MouseEvent).ctrlKey)) {
      e.preventDefault();
    }
  };

  // Registered before attachControl so these capture listeners run first on the window.
  const captureOpts: AddEventListenerOptions = { capture: true };
  window.addEventListener("pointerdown", onPointerDown, captureOpts);
  window.addEventListener("pointermove", onPointerMove, captureOpts);
  window.addEventListener("pointerup", onPointerEnd, captureOpts);
  window.addEventListener("pointercancel", onPointerEnd, captureOpts);
  window.addEventListener("contextmenu", onContextMenu, captureOpts);
  window.addEventListener("blur", onBlur);

  const detachOrbit = attachControl(camera, canvas, scene, {
    pointerMappings: { primaryButton: "rotate", secondaryButton: "pan" },
  });

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    window.removeEventListener("pointerdown", onPointerDown, captureOpts);
    window.removeEventListener("pointermove", onPointerMove, captureOpts);
    window.removeEventListener("pointerup", onPointerEnd, captureOpts);
    window.removeEventListener("pointercancel", onPointerEnd, captureOpts);
    window.removeEventListener("contextmenu", onContextMenu, captureOpts);
    window.removeEventListener("blur", onBlur);
    activePointerId = null;
    lastSource = null;
    detachOrbit();
  };
}
