import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { createFreeCamera, attachFreeControl } from "@babylonjs/lite";

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
  const camera = createFreeCamera(eye, target);
  scene.camera = camera;
  const detach = attachFreeControl(camera, canvas, scene);

  return {
    camera,
    jumpTo(eye: Vec, target: Vec): void {
      camera.position.x = eye.x;
      camera.position.y = eye.y;
      camera.position.z = eye.z;
      camera.target.x = target.x;
      camera.target.y = target.y;
      camera.target.z = target.z;
    },
    dispose(): void {
      detach();
    },
  };
}
