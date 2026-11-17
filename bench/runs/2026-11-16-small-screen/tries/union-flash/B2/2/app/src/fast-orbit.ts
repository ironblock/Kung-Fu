import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

export function attachFastOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  const originalAngularSensibility = camera.angularSensibility;

  // Babylon Lite's standard arc-rotate drag handler scales rotation by
  // angularSensibility, so halving it makes ordinary mouse/touch drags—and
  // their inertial glide—twice as far, while leaving wheel zoom unchanged.
  const fastAngularSensibility =
    Number.isFinite(originalAngularSensibility) && originalAngularSensibility !== 0
      ? originalAngularSensibility / 2
      : originalAngularSensibility;

  camera.angularSensibility = fastAngularSensibility;

  // The request is for mouse/touch controls only, so keyboard controls are
  // explicitly disabled if the library would otherwise attach them.
  const detachControls = attachControl(camera, canvas, scene, {
    keyboard: false,
  });

  let disposed = false;

  return () => {
    if (disposed) return;
    disposed = true;

    detachControls();
    camera.angularSensibility = originalAngularSensibility;
  };
}
