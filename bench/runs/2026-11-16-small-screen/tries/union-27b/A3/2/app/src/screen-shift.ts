import type { Camera } from "@babylonjs/lite";
import {
  getCameraPosition,
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
  resolveCameraViewport,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ShiftTracker {
  mark(): void;
  shift(point: Vec): { dx: number; dy: number };
}

interface MarkState {
  view: unknown;
  viewProjection: unknown;
  viewport: { x: number; y: number; width: number; height: number };
  backingWidth: number;
  backingHeight: number;
  cssWidth: number;
  cssHeight: number;
  floatingOrigin: boolean;
  origin?: Vec;
}

function positive(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function copyVec(v: Vec): Vec {
  return { x: v.x, y: v.y, z: v.z };
}

function copyMat4(m: unknown): unknown {
  const value = m as any;

  if (Array.isArray(value)) {
    return value.slice();
  }

  if (ArrayBuffer.isView(value) && !(value instanceof DataView)) {
    return new value.constructor(value);
  }

  if (value && typeof value === "object") {
    if (typeof value.length === "number") {
      const out = new Array(value.length);
      for (let i = 0; i < value.length; i++) {
        out[i] = value[i];
      }
      return out;
    }

    return { ...value };
  }

  return m;
}

function canvasSizes(canvas: HTMLCanvasElement) {
  const cssWidth = positive(canvas.clientWidth, canvas.width || 1);
  const cssHeight = positive(canvas.clientHeight, canvas.height || 1);
  const backingWidth = positive(canvas.width, cssWidth);
  const backingHeight = positive(canvas.height, cssHeight);

  return { backingWidth, backingHeight, cssWidth, cssHeight };
}

function capture(camera: Camera, canvas: HTMLCanvasElement): MarkState {
  const { backingWidth, backingHeight, cssWidth, cssHeight } = canvasSizes(canvas);

  let viewport = resolveCameraViewport(camera, backingWidth, backingHeight);
  if (
    !Number.isFinite(viewport.x) ||
    !Number.isFinite(viewport.y) ||
    !Number.isFinite(viewport.width) ||
    !Number.isFinite(viewport.height) ||
    viewport.width <= 0 ||
    viewport.height <= 0
  ) {
    viewport = { x: 0, y: 0, width: backingWidth, height: backingHeight };
  }

  let aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
  if (!Number.isFinite(aspect) || aspect <= 0) {
    aspect = backingWidth / backingHeight;
  }

  const view = copyMat4(getViewMatrix(camera));
  const viewProjection = copyMat4(getViewProjectionMatrix(camera, aspect));
  const floatingOrigin = Boolean(camera._useFloatingOrigin);
  const origin = floatingOrigin ? copyVec(getCameraPosition(camera)) : undefined;

  return {
    view,
    viewProjection,
    viewport: {
      x: viewport.x,
      y: viewport.y,
      width: viewport.width,
      height: viewport.height,
    },
    backingWidth,
    backingHeight,
    cssWidth,
    cssHeight,
    floatingOrigin,
    origin,
  };
}

function projectWithState(point: Vec, state: MarkState): { x: number; y: number } {
  const p = copyVec(point);

  const options: {
    viewport: { x: number; y: number; width: number; height: number };
    backingWidth: number;
    backingHeight: number;
    cssWidth: number;
    cssHeight: number;
    worldOrigin?: Vec;
  } = {
    viewport: state.viewport,
    backingWidth: state.backingWidth,
    backingHeight: state.backingHeight,
    cssWidth: state.cssWidth,
    cssHeight: state.cssHeight,
  };

  if (state.floatingOrigin && state.origin) {
    options.worldOrigin = copyVec(state.origin);
  }

  const result = projectWorldToScreen(
    p,
    state.view as any,
    state.viewProjection as any,
    options as any
  );

  return { x: result.cssX, y: result.cssY };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  let markState = capture(camera, canvas);

  return {
    mark() {
      markState = capture(camera, canvas);
    },

    shift(point) {
      const currentState = capture(camera, canvas);
      const before = projectWithState(point, markState);
      const after = projectWithState(point, currentState);

      return {
        dx: after.x - before.x,
        dy: after.y - before.y,
      };
    },
  };
}
