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
  target: Vec
): Walkthrough {
  const camera = createFreeCamera(
    { x: eye.x, y: eye.y, z: eye.z },
    { x: target.x, y: target.y, z: target.z }
  );
  scene.camera = camera;
  const detach = attachFreeControl(camera, canvas, scene);
  let disposed = false;

  return {
    camera,
    jumpTo(nextEye: Vec, nextTarget: Vec): void {
      const oriented = createFreeCamera(
        { x: nextEye.x, y: nextEye.y, z: nextEye.z },
        { x: nextTarget.x, y: nextTarget.y, z: nextTarget.z }
      );

      camera.position.x = nextEye.x;
      camera.position.y = nextEye.y;
      camera.position.z = nextEye.z;

      camera.target.x = nextTarget.x;
      camera.target.y = nextTarget.y;
      camera.target.z = nextTarget.z;

      camera._yaw = oriented._yaw;
      camera._pitch = oriented._pitch;
    },
    dispose(): void {
      if (disposed) return;
      disposed = true;
      detach();
    },
  };
}
