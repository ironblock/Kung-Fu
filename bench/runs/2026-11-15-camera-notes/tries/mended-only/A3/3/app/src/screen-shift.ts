import type { Camera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ShiftTracker {
  mark(): void;
  shift(point: Vec): { dx: number; dy: number };
}

interface ViewState {
  // Copies, because getViewMatrix/getProjectionMatrix return the camera's own
  // cache arrays, which are overwritten in place on the next call.
  view: Float64Array;
  proj: Float64Array;
}

// Row-vector convention (Babylon): clip = [x, y, z, 1] * view * proj,
// with element (row i, column j) stored at m[i * 4 + j].
function transformRow(v: number[], m: ArrayLike<number>): number[] {
  const r = [0, 0, 0, 0];
  for (let j = 0; j < 4; j++) {
    r[j] = v[0] * m[j] + v[1] * m[4 + j] + v[2] * m[8 + j] + v[3] * m[12 + j];
  }
  return r;
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  let marked: ViewState | null = null;

  function capture(): ViewState {
    // The camera renders to the whole canvas, so the aspect is the backing-store ratio.
    // NDC is independent of canvas size, so a stored projection stays valid if the canvas is resized.
    const aspect = canvas.width / canvas.height;
    return {
      view: Float64Array.from(camera.getViewMatrix()),
      proj: Float64Array.from(camera.getProjectionMatrix(aspect)),
    };
  }

  // Projects a world point to CSS pixels on the current canvas size (y down).
  function toCss(point: Vec, state: ViewState): { x: number; y: number } {
    const clip = transformRow([point.x, point.y, point.z, 1], state.view);
    const c = transformRow(clip, state.proj);
    const w = c[3];
    const ndcX = c[0] / w;
    const ndcY = c[1] / w;
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    return {
      x: (ndcX * 0.5 + 0.5) * cssW,
      y: (0.5 - ndcY * 0.5) * cssH,
    };
  }

  marked = capture();

  return {
    mark(): void {
      marked = capture();
    },
    shift(point: Vec): { dx: number; dy: number } {
      if (!marked) throw new Error("screen-shift: no mark has been taken");
      const now = capture();
      const before = toCss(point, marked);
      const after = toCss(point, now);
      return { dx: after.x - before.x, dy: after.y - before.y };
    },
  };
}
