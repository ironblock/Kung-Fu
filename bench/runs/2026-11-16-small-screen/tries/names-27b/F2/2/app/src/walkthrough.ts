import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";

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
  target: Vec
): Walkthrough {
  const camera = createFreeCamera(eye, target);

  // The SceneContext declaration is not included in the provided camera API,
  // so set the active camera through a structural cast.
  const sceneWithCamera = scene as unknown as { camera: FreeCamera };
  sceneWithCamera.camera = camera;

  const detach = attachFreeControl(camera, canvas, scene);
  let disposed = false;

  return {
    camera,
    jumpTo(eye, target) {
      camera.position.x = eye.x;
      camera.position.y = eye.y;
      camera.position.z = eye.z;

      camera.target.x = target.x;
      camera.target.y = target.y;
      camera.target.z = target.z;
    },
    dispose() {
      if (disposed) {
        return;
      }
      disposed = true;
      detach();
    },
  };
}
