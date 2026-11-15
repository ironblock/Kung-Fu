import type { Camera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

// The camera fields used here are the ones named in camera-notes.md
// (alpha, beta, radius, target, fov, ortho.halfHeight/left/right).
// The library source is not available on this machine, so the projection
// below follows Babylon's ArcRotateCamera conventions (left-handed, Y up,
// vertical fov) as I understand them, and has not been checked against Lite.
interface OrthoBounds { halfHeight: number; left: number | null; right: number | null }
interface ArcRotateLike {
  alpha: number;
  beta: number;
  radius: number;
  target: Vec;
  fov: number;
  ortho?: OrthoBounds | null;
}

// A by-value copy of the camera pose. Copying matters: the app may write
// target in place or replace the ortho object, and mark() must not change.
interface Pose {
  alpha: number;
  beta: number;
  radius: number;
  target: Vec;
  fov: number;
  ortho: OrthoBounds | null;
}

const UP: Vec = { x: 0, y: 1, z: 0 };

function readPose(camera: Camera): Pose {
  const c = camera as unknown as ArcRotateLike;
  if (typeof c.alpha !== "number" || typeof c.beta !== "number" || typeof c.radius !== "number" || !c.target) {
    throw new TypeError("trackScreenShift: expected an ArcRotateCamera (alpha, beta, radius, target)");
  }
  const o = c.ortho;
  return {
    alpha: c.alpha,
    beta: c.beta,
    radius: c.radius,
    target: { x: c.target.x, y: c.target.y, z: c.target.z },
    fov: c.fov,
    ortho: o ? { halfHeight: o.halfHeight, left: o.left, right: o.right } : null,
  };
}

function sub(a: Vec, b: Vec): Vec { return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }; }
function dot(a: Vec, b: Vec): number { return a.x * b.x + a.y * b.y + a.z * b.z; }
function cross(a: Vec, b: Vec): Vec {
  return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x };
}
function normalize(a: Vec): Vec {
  const l = Math.hypot(a.x, a.y, a.z);
  return { x: a.x / l, y: a.y / l, z: a.z / l };
}

// Where a world point lands on the canvas, in CSS pixels, y down.
// The camera fills the whole canvas, so the NDC square maps onto the CSS box.
function project(pose: Pose, p: Vec, aspect: number, cssW: number, cssH: number): { x: number; y: number } {
  // Eye position of an ArcRotateCamera.
  const cb = Math.cos(pose.beta);
  const sb = Math.sin(pose.beta);
  const eye: Vec = {
    x: pose.target.x + pose.radius * Math.cos(pose.alpha) * sb,
    y: pose.target.y + pose.radius * cb,
    z: pose.target.z + pose.radius * Math.sin(pose.alpha) * sb,
  };

  // Left-handed look-at view basis, up = +Y.
  const zAxis = normalize(sub(pose.target, eye));
  const xAxis = normalize(cross(UP, zAxis));
  const yAxis = cross(zAxis, xAxis);

  const d = sub(p, eye);
  const xv = dot(d, xAxis);
  const yv = dot(d, yAxis);
  const zv = dot(d, zAxis);

  let ndcX: number;
  let ndcY: number;
  if (pose.ortho) {
    const h = pose.ortho.halfHeight;
    const l = pose.ortho.left ?? -h * aspect;
    const r = pose.ortho.right ?? h * aspect;
    ndcX = (2 * xv - (l + r)) / (r - l);
    ndcY = yv / h;
  } else {
    // Perspective: fov is vertical. Depth (zv) is positive for points in front.
    const t = 1 / Math.tan(pose.fov / 2);
    ndcX = (t / aspect) * (xv / zv);
    ndcY = t * (yv / zv);
  }

  return { x: ((ndcX + 1) / 2) * cssW, y: ((1 - ndcY) / 2) * cssH };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  let marked: Pose = readPose(camera);

  return {
    mark(): void {
      marked = readPose(camera);
    },
    shift(point: Vec): { dx: number; dy: number } {
      if (canvas.width === 0 || canvas.height === 0) {
        throw new RangeError("trackScreenShift: canvas has zero backing size");
      }
      // Both positions use the current canvas, so only the camera differs.
      const aspect = canvas.width / canvas.height;
      const rect = canvas.getBoundingClientRect();
      const now = readPose(camera);
      const before = project(marked, point, aspect, rect.width, rect.height);
      const after = project(now, point, aspect, rect.width, rect.height);
      return { dx: after.x - before.x, dy: after.y - before.y };
    },
  };
}
