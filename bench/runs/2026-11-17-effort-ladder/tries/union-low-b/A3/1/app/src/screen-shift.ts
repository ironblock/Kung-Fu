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

interface Snapshot {
  view: Float32Array;
  vp: Float32Array;
  viewport: { x: number; y: number; width: number; height: number };
  bw: number;
  bh: number;
  cw: number;
  ch: number;
  origin: Vec | undefined;
}

function copyMat(m: unknown): Float32Array {
  const src = m as ArrayLike<number>;
  const out = new Float32Array(16);
  for (let i = 0; i < 16; i++) out[i] = src[i];
  return out;
}

function takeSnapshot(camera: Camera, canvas: HTMLCanvasElement): Snapshot {
  const bw = canvas.width;
  const bh = canvas.height;
  const cw = canvas.clientWidth;
  const ch = canvas.clientHeight;
  const aspect = getEffectiveAspectRatio(camera, bw, bh);
  const view = copyMat(getViewMatrix(camera));
  const vp = copyMat(getViewProjectionMatrix(camera, aspect));
  const rect = resolveCameraViewport(camera, bw, bh);
  let origin: Vec | undefined;
  if (camera._useFloatingOrigin) {
    const p = getCameraPosition(camera);
    origin = { x: p.x, y: p.y, z: p.z };
  }
  return { view, vp, viewport: rect, bw, bh, cw, ch, origin };
}

function projectAt(point: Vec, snap: Snapshot) {
  const opts: {
    viewport: { x: number; y: number; width: number; height: number };
    backingWidth: number;
    backingHeight: number;
    cssWidth: number;
    cssHeight: number;
    worldOrigin?: Vec;
  } = {
    viewport: snap.viewport,
    backingWidth: snap.bw,
    backingHeight: snap.bh,
    cssWidth: snap.cw,
    cssHeight: snap.ch,
  };
  if (snap.origin) opts.worldOrigin = snap.origin;
  return projectWorldToScreen(
    point as Parameters<typeof projectWorldToScreen>[0],
    snap.view as Parameters<typeof projectWorldToScreen>[1],
    snap.vp as Parameters<typeof projectWorldToScreen>[2],
    opts,
  );
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  let snap: Snapshot = takeSnapshot(camera, canvas);

  return {
    mark() {
      snap = takeSnapshot(camera, canvas);
    },
    shift(point: Vec) {
      const now = takeSnapshot(camera, canvas);
      const a = projectAt(point, snap);
      const b = projectAt(point, now);
      return { dx: b.cssX - a.cssX, dy: b.cssY - a.cssY };
    },
  };
}
