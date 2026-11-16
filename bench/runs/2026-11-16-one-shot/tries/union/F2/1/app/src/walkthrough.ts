import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
  readonly camera: FreeCamera;
  jumpTo(eye: Vec, target: Vec): void;
  dispose(): void;
}

// attachFreeControl aims from _yaw/_pitch, not from target, so both must
// match the new view or the first key press or drag will snap the view.
const MAX_PITCH = Math.PI / 2 - 0.01;

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
  const pitch = Math.atan2(dy, horizontal);
  camera._pitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, pitch));
}

export function createWalkthrough(
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  eye: Vec,
  target: Vec,
): Walkthrough {
  const camera = createFreeCamera(eye, target);
  aim(camera, eye, target);
  scene.camera = camera;

  let detach: (() => void) | null = attachFreeControl(camera, canvas, scene);
  let disposed = false;

  return {
    camera,

    jumpTo(newEye: Vec, newTarget: Vec): void {
      // Re-attaching drops any turn velocity still coasting from the old view.
      detach?.();
      detach = null;
      aim(camera, newEye, newTarget);
      if (!disposed) {
        detach = attachFreeControl(camera, canvas, scene);
      }
    },

    dispose(): void {
      if (disposed) return;
      disposed = true;
      detach?.();
      detach = null;
    },
  };
}
