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

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  interface Snapshot {
    view: Float32Array;
    viewProjection: Float32Array;
    viewport: { x: number; y: number; width: number; height: number };
    backingWidth: number;
    backingHeight: number;
    cssWidth: number;
    cssHeight: number;
    worldOrigin: Vec | undefined;
  }

  function takeSnapshot(): Snapshot {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);
    const viewport = resolveCameraViewport(camera, backingWidth, backingHeight);
    const worldOrigin = camera._useFloatingOrigin
      ? { ...getCameraPosition(camera) }
      : undefined;

    return {
      view: Float32Array.from(view),
      viewProjection: Float32Array.from(viewProjection),
      viewport: { ...viewport },
      backingWidth,
      backingHeight,
      cssWidth,
      cssHeight,
      worldOrigin,
    };
  }

  function projectSnap(point: Vec, snap: Snapshot): { cssX: number; cssY: number } {
    const r = projectWorldToScreen(point, snap.view, snap.viewProjection, {
      viewport: snap.viewport,
      backingWidth: snap.backingWidth,
      backingHeight: snap.backingHeight,
      cssWidth: snap.cssWidth,
      cssHeight: snap.cssHeight,
      worldOrigin: snap.worldOrigin,
    });
    return { cssX: r.cssX, cssY: r.cssY };
  }

  let markSnap: Snapshot = takeSnapshot();

  return {
    mark() {
      markSnap = takeSnapshot();
    },
    shift(point: Vec) {
      const now = takeSnapshot();
      const before = projectSnap(point, markSnap);
      const after = projectSnap(point, now);
      return { dx: after.cssX - before.cssX, dy: after.cssY - before.cssY };
    },
  };
}
