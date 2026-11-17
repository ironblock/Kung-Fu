import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl } from "@babylonjs/lite";

export function attachFastOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext
): () => void {
  const originalAngularSensibility = camera.angularSensibility;
  const fastAngularSensibility = originalAngularSensibility / 2;
  const changed =
    Number.isFinite(originalAngularSensibility) &&
    originalAngularSensibility !== 0 &&
    Number.isFinite(fastAngularSensibility) &&
    fastAngularSensibility !== originalAngularSensibility;

  if (changed) {
    camera.angularSensibility = fastAngularSensibility;
  }

  let detach: (() => void) | undefined;
  try {
    detach = attachControl(camera, canvas, scene);
  } catch (error) {
    if (changed) {
      camera.angularSensibility = originalAngularSensibility;
    }
    throw error;
  }

  let disposed = false;
  return () => {
    if (disposed) {
      return;
    }
    disposed = true;
    detach?.();
    if (changed) {
      camera.angularSensibility = originalAngularSensibility;
    }
  };
}
