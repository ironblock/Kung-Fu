import {
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
  resolveCameraViewport,
  type Camera,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

type Mat = ReturnType<typeof getViewMatrix>;
type ProjectionOptions = Parameters<typeof projectWorldToScreen>[3];

// Everything needed to project a world point onto the canvas as the camera
// was at one moment. Matrices are copied because the library may hand back
// cached storage that it later overwrites in place.
interface Snapshot {
  view: Mat;
  viewProjection: Mat;
  options: ProjectionOptions;
}

function takeSnapshot(camera: Camera, canvas: HTMLCanvasElement, copy: boolean): Snapshot {
  const backingWidth = canvas.width;
  const backingHeight = canvas.height;
  const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, aspect);
  return {
    view: copy ? structuredClone(view) : view,
    viewProjection: copy ? structuredClone(viewProjection) : viewProjection,
    options: {
      viewport: resolveCameraViewport(camera, backingWidth, backingHeight),
      backingWidth,
      backingHeight,
      cssWidth: canvas.clientWidth,
      cssHeight: canvas.clientHeight,
    },
  };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  let marked = takeSnapshot(camera, canvas, true);

  return {
    mark(): void {
      marked = takeSnapshot(camera, canvas, true);
    },
    shift(point: Vec): { dx: number; dy: number } {
      const now = takeSnapshot(camera, canvas, false);
      const before = projectWorldToScreen(point, marked.view, marked.viewProjection, marked.options);
      const after = projectWorldToScreen(point, now.view, now.viewProjection, now.options);
      return { dx: after.cssX - before.cssX, dy: after.cssY - before.cssY };
    },
  };
}
