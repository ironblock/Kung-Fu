import type { Camera } from "@babylonjs/lite";
import {
  getViewMatrix,
  getViewProjectionMatrix,
  getEffectiveAspectRatio,
  resolveCameraViewport,
  projectWorldToScreen,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ShiftTracker {
  mark(): void;
  shift(point: Vec): { dx: number; dy: number };
}

interface StoredState {
  view: Float32Array;
  vp: Float32Array;
  viewport: { x: number; y: number; width: number; height: number };
  backingWidth: number;
  backingHeight: number;
  cssWidth: number;
  cssHeight: number;
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  let stored: StoredState;

  function capture(): StoredState {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const view = getViewMatrix(camera);
    const viewCopy = view.slice();
    const vp = getViewProjectionMatrix(camera, aspect);
    const vpCopy = vp.slice();
    const viewport = resolveCameraViewport(camera, backingWidth, backingHeight);
    return {
      view: viewCopy,
      vp: vpCopy,
      viewport: { x: viewport.x, y: viewport.y, width: viewport.width, height: viewport.height },
      backingWidth,
      backingHeight,
      cssWidth,
      cssHeight,
    };
  }

  function projectWithState(point: Vec, state: StoredState): { cssX: number; cssY: number } {
    const result = projectWorldToScreen(point, state.view, state.vp, {
      viewport: state.viewport,
      backingWidth: state.backingWidth,
      backingHeight: state.backingHeight,
      cssWidth: state.cssWidth,
      cssHeight: state.cssHeight,
    });
    return { cssX: result.cssX, cssY: result.cssY };
  }

  function mark() {
    stored = capture();
  }

  function shift(point: Vec): { dx: number; dy: number } {
    const current = capture();
    const before = projectWithState(point, stored);
    const after = projectWithState(point, current);
    return { dx: after.cssX - before.cssX, dy: after.cssY - before.cssY };
  }

  mark();

  return { mark, shift };
}
