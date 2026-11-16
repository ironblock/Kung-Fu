import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
  readonly camera: FreeCamera;
  jumpTo(eye: Vec, target: Vec): void;
  dispose(): void;
}

// Yaw/pitch that point a free camera from `eye` toward `target`, using
// Babylon's free-camera convention: forward = (sin(yaw)cos(pitch), -sin(pitch), cos(yaw)cos(pitch)).
// Returns null when eye and target coincide, so the current orientation is kept.
function orientationFor(eye: Vec, target: Vec): { yaw: number; pitch: number } | null {
  const dx = target.x - eye.x;
  const dy = target.y - eye.y;
  const dz = target.z - eye.z;
  const horizontal = Math.hypot(dx, dz);
  const length = Math.hypot(horizontal, dy);
  if (length < 1e-9) {
    return null;
  }
  return {
    yaw: Math.atan2(dx, dz),
    pitch: Math.atan2(-dy, horizontal),
  };
}

export function createWalkthrough(
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  eye: Vec,
  target: Vec,
): Walkthrough {
  const camera = createFreeCamera({ x: eye.x, y: eye.y, z: eye.z }, { x: target.x, y: target.y, z: target.z });
  scene.camera = camera;

  const detach = attachFreeControl(camera, canvas, scene);

  return {
    camera,

    jumpTo(newEye: Vec, newTarget: Vec): void {
      camera.position.x = newEye.x;
      camera.position.y = newEye.y;
      camera.position.z = newEye.z;

      camera.target.x = newTarget.x;
      camera.target.y = newTarget.y;
      camera.target.z = newTarget.z;

      // The controls steer from the camera's stored yaw and pitch, not from
      // target alone, so update those too. Otherwise W and mouse drag would
      // resume from the old view.
      const orientation = orientationFor(newEye, newTarget);
      if (orientation) {
        camera._yaw = orientation.yaw;
        camera._pitch = orientation.pitch;
      }
    },

    dispose(): void {
      detach();
    },
  };
}
