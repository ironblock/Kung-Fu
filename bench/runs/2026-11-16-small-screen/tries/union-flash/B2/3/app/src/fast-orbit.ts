import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

interface FastOrbitState {
  originalAngularSensibility: number;
  attachedCount: number;
}

const fastOrbitStates = new WeakMap<ArcRotateCamera, FastOrbitState>();

export function attachFastOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext
): () => void {
  let state = fastOrbitStates.get(camera);
  if (!state) {
    state = {
      originalAngularSensibility: camera.angularSensibility,
      attachedCount: 0,
    };
    fastOrbitStates.set(camera, state);
  }

  const original = state.originalAngularSensibility;
  state.attachedCount += 1;

  // The default arc-rotate pointer controls compute rotate offsets roughly as:
  //   inertialAlphaOffset -= dx / angularSensibility
  //   inertialBetaOffset -= dy / angularSensibility
  // and then apply those offsets each frame while multiplying them by inertia.
  // Halving angularSensibility therefore doubles both the drag response and the
  // post-release glide for alpha/beta, without touching wheel zoom
  // (wheelPrecision/radius) or panning (panningSensibility).
  camera.angularSensibility = original / 2;

  let disposeControls: () => void;
  try {
    disposeControls = attachControl(camera, canvas, scene);
  } catch (error) {
    state.attachedCount -= 1;
    if (state.attachedCount === 0) {
      camera.angularSensibility = original;
      fastOrbitStates.delete(camera);
    }
    throw error;
  }

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;

    try {
      disposeControls();
    } finally {
      state.attachedCount -= 1;
      if (state.attachedCount === 0) {
        camera.angularSensibility = original;
        fastOrbitStates.delete(camera);
      }
    }
  };
}
