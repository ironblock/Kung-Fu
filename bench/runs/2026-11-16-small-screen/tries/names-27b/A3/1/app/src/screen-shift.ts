import type { Camera } from "@babylonjs/lite";
import {
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

type Mat = ReturnType<typeof getViewMatrix>;

interface Snapshot {
  view: Mat;
  viewProjection: Mat;
  viewport: { x: number; y: number; width: number; height: number };
  backingWidth: number;
  backingHeight: number;
  cssWidth: number;
  cssHeight: number;
}

function copyMatrix<T>(matrix: T): T {
  const source = matrix as unknown as ArrayLike<number> & { length: number };
  const copy = new Float32Array(source.length);
  for (let i = 0; i < source.length; i += 1) {
    copy[i] = source[i];
  }
  return copy as unknown as T;
}

function positiveSize(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  function takeSnapshot(): Snapshot {
    const cssWidthRaw = canvas.clientWidth;
    const cssHeightRaw = canvas.clientHeight;
    const backingWidthRaw = canvas.width;
    const backingHeightRaw = canvas.height;

    const cssWidth = positiveSize(cssWidthRaw, positiveSize(backingWidthRaw, 1));
    const cssHeight = positiveSize(cssHeightRaw, positiveSize(backingHeightRaw, 1));
    const backingWidth = positiveSize(backingWidthRaw, cssWidth);
    const backingHeight = positiveSize(backingHeightRaw, cssHeight);

    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);
    const viewport = resolveCameraViewport(camera, backingWidth, backingHeight);

    return {
      view: copyMatrix(view),
      viewProjection: copyMatrix(viewProjection),
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
    };
  }

  function project(snapshot: Snapshot, point: Vec) {
    return projectWorldToScreen(point, snapshot.view, snapshot.viewProjection, {
      viewport: snapshot.viewport,
      backingWidth: snapshot.backingWidth,
      backingHeight: snapshot.backingHeight,
      cssWidth: snapshot.cssWidth,
      cssHeight: snapshot.cssHeight,
    });
  }

  let marked = takeSnapshot();

  return {
    mark() {
      marked = takeSnapshot();
    },
    shift(point: Vec) {
      const before = project(marked, point);
      const after = project(takeSnapshot(), point);

      if (
        before.behindCamera ||
        after.behindCamera ||
        !Number.isFinite(before.cssX) ||
        !Number.isFinite(before.cssY) ||
        !Number.isFinite(after.cssX) ||
        !Number.isFinite(after.cssY)
      ) {
        return { dx: 0, dy: 0 };
      }

      return {
        dx: after.cssX - before.cssX,
        dy: after.cssY - before.cssY,
      };
    },
  };
}
