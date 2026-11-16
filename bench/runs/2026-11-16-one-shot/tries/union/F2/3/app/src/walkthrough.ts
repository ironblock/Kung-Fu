import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface Walkthrough {
  readonly camera: FreeCamera;
  jumpTo(eye: Vec, target: Vec): void;
  dispose(): void;
}

const copyVec = (v: Vec): Vec => ({ x: v.x, y: v.y, z: v.z });

export function createWalkthrough(
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  eye: Vec,
  target: Vec,
): Walkthrough {
  const camera: FreeCamera = createFreeCamera(copyVec(eye), copyVec(target));
  scene.camera = camera;

  // The free controls aim from camera._yaw / camera._pitch, not from target
  // (camera-notes 5, 52), so a jump must set those too.
  let detach: (() => void) | null = attachFreeControl(camera, canvas, scene);

  return {
    camera,

    jumpTo(newEye: Vec, newTarget: Vec): void {
      // The view is built from position and target (notes 69).
      camera.position.x = newEye.x;
      camera.position.y = newEye.y;
      camera.position.z = newEye.z;
      camera.target.x = newTarget.x;
      camera.target.y = newTarget.y;
      camera.target.z = newTarget.z;

      // Take yaw and pitch from a camera the library builds for this exact
      // look direction, so the sign and angle conventions are the library's own.
      const aim = createFreeCamera(copyVec(newEye), copyVec(newTarget));
      camera._yaw = aim._yaw;
      camera._pitch = aim._pitch;
    },

    dispose(): void {
      if (detach) {
        detach();
        detach = null;
      }
    },
  };
}
