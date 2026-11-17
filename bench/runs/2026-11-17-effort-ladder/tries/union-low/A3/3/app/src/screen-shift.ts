import type { Camera } from "@babylonjs/lite";
import {
  getViewMatrix,
  getViewProjectionMatrix,
  getCameraPosition,
  getEffectiveAspectRatio,
  resolveCameraViewport,
  projectWorldToScreen,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ShiftTracker {
  mark(): void;
  shift(point: Vec): { dx: number; dy: number };
}

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

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  let snapshot: Snapshot;

  function takeSnapshot(): Snapshot {
    const aspect = getEffectiveAspectRatio(camera, canvas.width, canvas.height);
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);

    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;

    const viewport = resolveCameraViewport(camera, backingWidth, backingHeight);

    let worldOrigin: Vec | undefined;
    if (camera._useFloatingOrigin) {
      const pos = getCameraPosition(camera);
      worldOrigin = { x: pos.x, y: pos.y, z: pos.z };
    }

    return {
      view: new Float32Array(view),
      viewProjection: new Float32Array(viewProjection),
      viewport: { x: viewport.x, y: viewport.y, width: viewport.width, height: viewport.height },
      backingWidth,
      backingHeight,
      cssWidth,
      cssHeight,
      worldOrigin,
    };
  }

  function projectWith(snap: Snapshot, point: Vec): { cssX: number; cssY: number } {
    const result = projectWorldToScreen(point, snap.view, snap.viewProjection, {
      viewport: snap.viewport,
      backingWidth: snap.backingWidth,
      backingHeight: snap.backingHeight,
      worldOrigin: snap.worldOrigin,
      cssWidth: snap.cssWidth,
      cssHeight: snap.cssHeight,
    });
    return { cssX: result.cssX, cssY: result.cssY };
  }

  snapshot = takeSnapshot();

  return {
    mark() {
      snapshot = takeSnapshot();
    },
    shift(point: Vec): { dx: number; dy: number } {
      const before = projectWith(snapshot, point);
      const after = projectWith(takeSnapshot(), point);
      return { dx: after.cssX - before.cssX, dy: after.cssY - before.cssY };
    },
  };
}
