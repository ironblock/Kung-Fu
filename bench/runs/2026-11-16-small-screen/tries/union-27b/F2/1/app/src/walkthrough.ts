import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
  readonly camera: FreeCamera;
  jumpTo(eye: Vec, target: Vec): void;
  dispose(): void;
}

// attachFreeControl aims from FreeCamera._yaw/_pitch, which it only sets at
// creation and from its own drags; a hand-set target is replaced on the next
// key move or drag. So a jump must resync _yaw/_pitch, or W and drags would
// keep aiming from the previous viewpoint.
const PITCH_LIMIT = Math.PI / 2 - 0.01;

export function createWalkthrough(
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  eye: Vec,
  target: Vec
): Walkthrough {
  const camera = createFreeCamera(eye, target);
  scene.camera = camera;

  // The scene is required: without it the control's per-frame step never moves the camera.
  const detach = attachFreeControl(camera, canvas, scene);

  let disposed = false;

  return {
    camera,

    jumpTo(eye, target) {
      // Move both ends of the view; moving position alone would turn the camera.
      camera.position.x = eye.x;
      camera.position.y = eye.y;
      camera.position.z = eye.z;
      camera.target.x = target.x;
      camera.target.y = target.y;
      camera.target.z = target.z;

      const dx = target.x - eye.x;
      const dy = target.y - eye.y;
      const dz = target.z - eye.z;
      camera._yaw = Math.atan2(dx, dz);
      const pitch = Math.atan2(dy, Math.hypot(dx, dz));
      camera._pitch = Math.min(PITCH_LIMIT, Math.max(-PITCH_LIMIT, pitch));
    },

    dispose() {
      if (disposed) return;
      disposed = true;
      detach();
    },
  };
}
