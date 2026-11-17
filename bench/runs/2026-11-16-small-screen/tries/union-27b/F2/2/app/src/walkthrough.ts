import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
  readonly camera: FreeCamera;
  jumpTo(eye: Vec, target: Vec): void;
  dispose(): void;
}

const PITCH_LIMIT = Math.PI / 2 - 0.01;

function setView(camera: FreeCamera, eye: Vec, target: Vec): void {
  const dx = target.x - eye.x;
  const dy = target.y - eye.y;
  const dz = target.z - eye.z;

  const horizontal = Math.hypot(dx, dz);
  const distance = Math.hypot(dx, dy, dz);

  const yaw = Math.atan2(dx, dz);
  const pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, Math.atan2(dy, horizontal)));

  const scale = distance > 0 ? distance : 1;
  const cosPitch = Math.cos(pitch);
  const newTarget: Vec = {
    x: eye.x + Math.sin(yaw) * cosPitch * scale,
    y: eye.y + Math.sin(pitch) * scale,
    z: eye.z + Math.cos(yaw) * cosPitch * scale,
  };

  const newEye: Vec = { x: eye.x, y: eye.y, z: eye.z };
  Object.assign(camera.position, newEye);
  Object.assign(camera.target, newTarget);
  camera._yaw = yaw;
  camera._pitch = pitch;
}

export function createWalkthrough(
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  eye: Vec,
  target: Vec
): Walkthrough {
  const camera = createFreeCamera(
    { x: eye.x, y: eye.y, z: eye.z },
    { x: target.x, y: target.y, z: target.z }
  );
  setView(camera, eye, target);
  scene.camera = camera;

  const detach = attachFreeControl(camera, canvas, scene);
  let disposed = false;

  return {
    camera,
    jumpTo(eye: Vec, target: Vec): void {
      setView(camera, eye, target);
    },
    dispose(): void {
      if (disposed) return;
      disposed = true;
      detach();
    },
  };
}
