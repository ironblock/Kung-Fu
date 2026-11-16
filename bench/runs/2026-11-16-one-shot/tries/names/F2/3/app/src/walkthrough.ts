import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
  readonly camera: FreeCamera;
  jumpTo(eye: Vec, target: Vec): void;
  dispose(): void;
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
  scene.camera = camera;

  let detachControls: (() => void) | null = attachFreeControl(camera, canvas, scene);
  let disposed = false;

  return {
    camera,

    jumpTo(newEye: Vec, newTarget: Vec): void {
      // Move the camera, then reattach the controls so they start from the new pose
      // (forward direction and mouse-drag look are derived from it).
      detachControls?.();
      detachControls = null;

      camera.position.x = newEye.x;
      camera.position.y = newEye.y;
      camera.position.z = newEye.z;
      camera.target.x = newTarget.x;
      camera.target.y = newTarget.y;
      camera.target.z = newTarget.z;

      if (!disposed) {
        detachControls = attachFreeControl(camera, canvas, scene);
      }
    },

    dispose(): void {
      disposed = true;
      detachControls?.();
      detachControls = null;
    },
  };
}
