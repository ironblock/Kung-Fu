import {
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
  type Camera,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
type Mat = ReturnType<typeof getViewMatrix>;

export interface ShiftTracker {
  mark(): void;
  shift(point: Vec): { dx: number; dy: number };
}

interface Snapshot {
  view: Mat;
  viewProjection: Mat;
}

// The library may hand back its own cached matrix storage, which is rewritten
// when the camera changes. Copy so the marked state stays fixed.
function copyMat(m: Mat): Mat {
  return (m as Mat & { slice(): Mat }).slice();
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  // Whole canvas is the viewport. Backing size maps the projection to pixels;
  // the CSS size converts the result to CSS pixels.
  const screenOptions = () => ({
    viewport: { x: 0, y: 0, width: canvas.width, height: canvas.height },
    backingWidth: canvas.width,
    backingHeight: canvas.height,
    cssWidth: canvas.clientWidth,
    cssHeight: canvas.clientHeight,
  });

  const currentState = (): Snapshot => {
    const aspect = getEffectiveAspectRatio(camera, canvas.width, canvas.height);
    return {
      view: getViewMatrix(camera),
      viewProjection: getViewProjectionMatrix(camera, aspect),
    };
  };

  let marked: Snapshot | null = null;

  const mark = (): void => {
    const now = currentState();
    marked = { view: copyMat(now.view), viewProjection: copyMat(now.viewProjection) };
  };

  mark();

  return {
    mark,
    shift(point: Vec) {
      if (!marked) {
        mark();
      }
      const before = marked!;
      const now = currentState();
      const options = screenOptions();
      const a = projectWorldToScreen(point, before.view, before.viewProjection, options);
      const b = projectWorldToScreen(point, now.view, now.viewProjection, options);
      return { dx: b.cssX - a.cssX, dy: b.cssY - a.cssY };
    },
  };
}
