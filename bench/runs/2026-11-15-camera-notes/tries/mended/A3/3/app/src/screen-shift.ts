import type { Camera } from "@babylonjs/lite";
import {
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

type ViewMatrix = ReturnType<typeof getViewMatrix>;
type ViewProjectionMatrix = ReturnType<typeof getViewProjectionMatrix>;
type ProjectionOptions = Parameters<typeof projectWorldToScreen>[3];

interface Frame {
  view: ViewMatrix;
  viewProjection: ViewProjectionMatrix;
  options: ProjectionOptions;
}

// Reads the camera's current matrices and the canvas geometry. The matrices
// returned by the library are the camera's own cache arrays, so callers that
// keep them must copy them (see mark()).
function readFrame(camera: Camera, canvas: HTMLCanvasElement): Frame {
  const aspect = getEffectiveAspectRatio(camera, canvas.width, canvas.height);
  return {
    view: getViewMatrix(camera),
    viewProjection: getViewProjectionMatrix(camera, aspect),
    options: {
      viewport: { x: 0, y: 0, width: canvas.width, height: canvas.height },
      backingWidth: canvas.width,
      backingHeight: canvas.height,
      cssWidth: canvas.clientWidth,
      cssHeight: canvas.clientHeight,
    },
  };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  let marked: Frame | null = null;

  const mark = (): void => {
    const current = readFrame(camera, canvas);
    marked = {
      view: structuredClone(current.view),
      viewProjection: structuredClone(current.viewProjection),
      options: current.options,
    };
  };

  const shift = (point: Vec): { dx: number; dy: number } => {
    if (marked === null) {
      throw new Error("screen-shift: no mark has been taken");
    }
    const before = projectWorldToScreen(point, marked.view, marked.viewProjection, marked.options);
    const now = readFrame(camera, canvas);
    const after = projectWorldToScreen(point, now.view, now.viewProjection, now.options);
    return { dx: after.cssX - before.cssX, dy: after.cssY - before.cssY };
  };

  mark();
  return { mark, shift };
}
