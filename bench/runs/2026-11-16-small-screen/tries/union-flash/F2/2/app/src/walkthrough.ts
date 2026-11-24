import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { createFreeCamera, attachFreeControl } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
  readonly camera: FreeCamera;
  jumpTo(eye: Vec, target: Vec): void;
  dispose(): void;
}

const EPS = 1e-6;
const PITCH_LIMIT = Math.PI / 2 - 0.01;

function finite(v: number): number {
  return Number.isFinite(v) ? v : 0;
}

function safeVec(v: Vec): Vec {
  return {
    x: finite(v.x),
    y: finite(v.y),
    z: finite(v.z),
  };
}

function clampPitch(v: number): number {
  return Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, finite(v)));
}

function setVec3(vec: Vec, x: number, y: number, z: number): void {
  vec.x = finite(x);
  vec.y = finite(y);
  vec.z = finite(z);
}

function setCameraVec(vec: FreeCamera["position"], x: number, y: number, z: number): void {
  setVec3(vec as unknown as Vec, x, y, z);
}

function forwardFromYawPitch(yaw: number, pitch: number): Vec {
  const cp = Math.cos(pitch);
  return {
    x: Math.sin(yaw) * cp,
    y: Math.sin(pitch),
    z: Math.cos(yaw) * cp,
  };
}

function applyView(camera: FreeCamera, eye: Vec, target: Vec): void {
  const ex = finite(eye.x);
  const ey = finite(eye.y);
  const ez = finite(eye.z);
  const tx = finite(target.x);
  const ty = finite(target.y);
  const tz = finite(target.z);

  const dx = tx - ex;
  const dy = ty - ey;
  const dz = tz - ez;
  const len = Math.hypot(dx, dy, dz);

  let yaw: number;
  let pitch: number;
  let useForwardTarget = false;

  if (len > EPS) {
    yaw = finite(Math.atan2(dx, dz));
    const horiz = Math.hypot(dx, dz);
    const rawPitch = Math.atan2(dy, horiz);
    pitch = clampPitch(rawPitch);

    // If the requested direction is degenerate or beyond the control pitch clamp,
    // keep the camera consistent with _yaw/_pitch by writing a 1-unit forward target.
    useForwardTarget = !Number.isFinite(rawPitch) || Math.abs(rawPitch) > PITCH_LIMIT;
  } else {
    // eye == target cannot define a look direction; preserve the current orientation.
    yaw = finite(camera._yaw);
    pitch = clampPitch(camera._pitch);
    useForwardTarget = true;
  }

  // attachFreeControl derives its look/movement state from _yaw/_pitch.
  // Hand-set target values are replaced on the next key move or drag, so setting
  // _yaw/_pitch is what makes controls carry on from the new viewpoint.
  camera._yaw = yaw;
  camera._pitch = pitch;

  setCameraVec(camera.position, ex, ey, ez);

  if (useForwardTarget) {
    const f = forwardFromYawPitch(yaw, pitch);
    setCameraVec(camera.target, ex + f.x, ey + f.y, ez + f.z);
  } else {
    setCameraVec(camera.target, tx, ty, tz);
  }
}

function setSceneCamera(scene: SceneContext, camera: FreeCamera): void {
  (scene as unknown as { camera: FreeCamera }).camera = camera;
}

export function createWalkthrough(
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  eye: Vec,
  target: Vec,
): Walkthrough {
  const safeEye = safeVec(eye);
  const safeTarget = safeVec(target);

  const camera = createFreeCamera(safeEye, safeTarget);
  applyView(camera, safeEye, safeTarget);
  setSceneCamera(scene, camera);

  let disposed = false;
  let detach = attachFreeControl(camera, canvas, scene);

  return {
    camera,

    jumpTo(eye: Vec, target: Vec): void {
      if (disposed) return;
      applyView(camera, eye, target);
    },

    dispose(): void {
      if (disposed) return;
      disposed = true;
      detach();
      detach = () => {};
    },
  };
}
