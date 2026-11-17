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

  function jumpTo(eye: Vec, target: Vec): void {
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
    camera._pitch = Math.atan2(dy, Math.sqrt(dx * dx + dz * dz));
  }

  function dispose(): void {
    detach();
  }

  return { camera, jumpTo, dispose };
}
