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
  type Mat = ReturnType<typeof getViewMatrix>;

  function copyMat(m: Mat): Mat {
    return Array.from(m as unknown as ArrayLike<number>) as unknown as Mat;
  }

  interface Snapshot {
    view: Mat;
    viewProjection: Mat;
    viewport: { x: number; y: number; width: number; height: number };
    backingWidth: number;
    backingHeight: number;
    cssWidth: number;
    cssHeight: number;
    worldOrigin: Vec | null;
  }

  function capture(): Snapshot {
    const bw = canvas.width;
    const bh = canvas.height;
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    const aspect = getEffectiveAspectRatio(camera, bw, bh);
    const view = copyMat(getViewMatrix(camera));
    const vp = copyMat(getViewProjectionMatrix(camera, aspect));
    const vpix = resolveCameraViewport(camera, bw, bh);
    const wo = camera._useFloatingOrigin ? getCameraPosition(camera) : null;

    return {
      view,
      viewProjection: vp,
      viewport: { x: vpix.x, y: vpix.y, width: vpix.width, height: vpix.height },
      backingWidth: bw,
      backingHeight: bh,
      cssWidth: cw,
      cssHeight: ch,
      worldOrigin: wo ? { x: wo.x, y: wo.y, z: wo.z } : null,
    };
  }

  let snap: Snapshot = capture();

  return {
    mark() {
      snap = capture();
    },
    shift(point: Vec): { dx: number; dy: number } {
      const oldRes = projectWorldToScreen(
        point,
        snap.view,
        snap.viewProjection,
        {
          viewport: snap.viewport,
          backingWidth: snap.backingWidth,
          backingHeight: snap.backingHeight,
          cssWidth: snap.cssWidth,
          cssHeight: snap.cssHeight,
          worldOrigin: snap.worldOrigin ?? undefined,
        }
      );

      const bw = canvas.width;
      const bh = canvas.height;
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      const aspect = getEffectiveAspectRatio(camera, bw, bh);
      const curView = getViewMatrix(camera);
      const curVP = getViewProjectionMatrix(camera, aspect);
      const curVpix = resolveCameraViewport(camera, bw, bh);
      const curWo = camera._useFloatingOrigin ? getCameraPosition(camera) : null;

      const newRes = projectWorldToScreen(
        point,
        curView,
        curVP,
        {
          viewport: curVpix,
          backingWidth: bw,
          backingHeight: bh,
          cssWidth: cw,
          cssHeight: ch,
          worldOrigin: curWo ?? undefined,
        }
      );

      return {
        dx: newRes.cssX - oldRes.cssX,
        dy: newRes.cssY - oldRes.cssY,
      };
    },
  };
}
