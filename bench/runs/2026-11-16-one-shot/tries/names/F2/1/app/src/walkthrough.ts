import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
  readonly camera: FreeCamera;
  jumpTo(eye: Vec, target: Vec): void;
  dispose(): void;
}

// Assumed convention (unverified, see notes):
//   forward = (sin(yaw) * cos(pitch), -sin(pitch), cos(yaw) * cos(pitch))
// Yaw and pitch are the camera's internal _yaw/_pitch fields, so the
// free-camera controls keep the same view after a jump.
function aim(camera: FreeCamera, eye: Vec, target: Vec): void {
  camera.position.x = eye.x;
  camera.position.y = eye.y;
  camera.position.z = eye.z;
  camera.target.x = target.x;
  camera.target.y = target.y;
  camera.target.z = target.z;

  const dx = target.x - eye.x;
  const dy = target.y - eye.y;
  const dz = target.z - eye.z;
  const horizontal = Math.hypot(dx, dz);
  camera._yaw = Math.atan2(dx, dz);
  camera._pitch = Math.atan2(-dy, horizontal);
}

export function createWalkthrough(
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  eye: Vec,
  target: Vec,
): Walkthrough {
  const camera = createFreeCamera(
    { x: eye.x, y: eye.y, z: eye.z },
    { x: target.x, y: target.y, z: target.z },
  );
  aim(camera, eye, target);
  scene.camera = camera;

  const detach = attachFreeControl(camera, canvas, scene);

  return {
    camera,
    jumpTo(newEye: Vec, newTarget: Vec): void {
      aim(camera, newEye, newTarget);
    },
    dispose(): void {
      detach();
    },
  };
}
