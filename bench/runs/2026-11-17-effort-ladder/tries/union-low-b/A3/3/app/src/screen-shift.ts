import type { Camera } from "@babylonjs/lite";
import {
  getViewMatrix,
  getViewProjectionMatrix,
  getEffectiveAspectRatio,
  resolveCameraViewport,
  projectWorldToScreen,
  getCameraPosition,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ShiftTracker {
  mark(): void;
  shift(point: Vec): { dx: number; dy: number };
}

interface CapturedState {
  view: Float32Array;
  viewProjection: Float32Array;
  viewport: { x: number; y: number; width: number; height: number };
  backingWidth: number;
  backingHeight: number;
  cssWidth: number;
  cssHeight: number;
  worldOrigin: Vec | undefined;
}

function captureState(camera: Camera, canvas: HTMLCanvasElement): CapturedState {
  const w = canvas.width;
  const h = canvas.height;
  const aspect = getEffectiveAspectRatio(camera, w, h);
  const view = getViewMatrix(camera);
  const vp = getViewProjectionMatrix(camera, aspect);
  const viewport = resolveCameraViewport(camera, w, h);

  let worldOrigin: Vec | undefined;
  if (camera._useFloatingOrigin) {
    const pos = getCameraPosition(camera);
    worldOrigin = { x: pos.x, y: pos.y, z: pos.z };
  }

  return {
    view: new Float32Array(view),
    viewProjection: new Float32Array(vp),
    viewport: { x: viewport.x, y: viewport.y, width: viewport.width, height: viewport.height },
    backingWidth: w,
    backingHeight: h,
    cssWidth: canvas.clientWidth,
    cssHeight: canvas.clientHeight,
    worldOrigin,
  };
}

function projectWithState(point: Vec, state: CapturedState): { cssX: number; cssY: number } {
  const result = projectWorldToScreen(
    point,
    state.view,
    state.viewProjection,
    {
      viewport: state.viewport,
      backingWidth: state.backingWidth,
      backingHeight: state.backingHeight,
      worldOrigin: state.worldOrigin,
      cssWidth: state.cssWidth,
      cssHeight: state.cssHeight,
    },
  );
  return { cssX: result.cssX, cssY: result.cssY };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  let captured: CapturedState = captureState(camera, canvas);

  return {
    mark() {
      captured = captureState(camera, canvas);
    },
    shift(point: Vec): { dx: number; dy: number } {
      const old = projectWithState(point, captured);
      const now = projectWithState(point, captureState(camera, canvas));
      return { dx: now.cssX - old.cssX, dy: now.cssY - old.cssY };
    },
  };
}
