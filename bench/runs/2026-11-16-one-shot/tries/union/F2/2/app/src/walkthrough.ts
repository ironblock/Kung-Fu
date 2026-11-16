import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
  readonly camera: FreeCamera;
  jumpTo(eye: Vec, target: Vec): void;
  dispose(): void;
}

function copyInto(dst: Vec, src: Vec): void {
  dst.x = src.x;
  dst.y = src.y;
  dst.z = src.z;
}

function placeCamera(camera: FreeCamera, eye: Vec, target: Vec): void {
  copyInto(camera.position, eye);
  copyInto(camera.target, target);
  // The free-camera controls aim from _yaw/_pitch and rebuild target from them
  // on the next key move or drag. Take the angles the library computes for this
  // look direction, so the controls continue along the new view.
  const aim = createFreeCamera({ ...eye }, { ...target });
  camera._yaw = aim._yaw;
  camera._pitch = aim._pitch;
}

export function createWalkthrough(
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  eye: Vec,
  target: Vec,
): Walkthrough {
  const camera = createFreeCamera({ ...eye }, { ...target });
  scene.camera = camera;
  // Without a scene, attachFreeControl does not move the camera, so pass it.
  const detach = attachFreeControl(camera, canvas, scene);
  let disposed = false;

  return {
    camera,
    jumpTo(newEye, newTarget) {
      if (disposed) return;
      placeCamera(camera, newEye, newTarget);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      detach();
    },
  };
}
