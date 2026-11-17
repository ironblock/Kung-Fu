import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

type Disposer = () => void;
type RemoveFunction = (...args: unknown[]) => void;

type UnknownObservable = {
  add?: (callback: () => void) => Disposer | { remove?: RemoveFunction } | unknown;
  remove?: RemoveFunction;
  removeObserver?: RemoveFunction;
};

type SceneWithRenderObservers = {
  onBeforeRenderObservable?: UnknownObservable;
  beforeRenderObservable?: UnknownObservable;
  onRenderObservable?: UnknownObservable;
  renderObservable?: UnknownObservable;
  onAfterRenderObservable?: UnknownObservable;
  afterRenderObservable?: UnknownObservable;
};

type FrameScheduler = (callback: () => void) => number;
type FrameCanceller = (handle: number) => void;

function normalizeLimits(minDistance: number, maxDistance: number): readonly [number, number] {
  let lower = minDistance;
  let upper = maxDistance;

  if (!Number.isFinite(lower)) lower = 0;
  if (!Number.isFinite(upper)) upper = Infinity;

  if (lower > upper) {
    const swap = lower;
    lower = upper;
    upper = swap;
  }

  // Radius is a distance, so negative minimums are not useful.
  if (lower < 0) lower = 0;
  if (upper < lower) upper = lower;

  return [lower, upper];
}

function safeCall(fn: Disposer | null | undefined): void {
  if (typeof fn === "function") {
    try {
      fn();
    } catch {
      // Ignore disposer errors; continue tearing down the rest.
    }
  }
}

function registerRenderObserver(
  scene: SceneContext | null | undefined,
  callback: () => void
): Disposer | null {
  if (!scene) return null;

  const s = scene as unknown as SceneWithRenderObservers;
  const candidates = [
    s.onBeforeRenderObservable,
    s.beforeRenderObservable,
    s.onRenderObservable,
    s.renderObservable,
    s.onAfterRenderObservable,
    s.afterRenderObservable,
  ];

  for (const obs of candidates) {
    if (!obs || typeof obs !== "object") continue;
    if (typeof obs.add !== "function") continue;

    // Only use an observable if we can remove it safely.
    const canRemoveDirectly =
      typeof obs.remove === "function" || typeof obs.removeObserver === "function";
    if (!canRemoveDirectly) continue;

    let result: unknown;
    try {
      result = obs.add(callback);
    } catch {
      if (typeof obs.remove === "function") {
        try {
          obs.remove(callback);
        } catch {
          // Ignore failed cleanup attempts and try the next observable.
        }
      }
      if (typeof obs.removeObserver === "function") {
        try {
          obs.removeObserver(callback);
        } catch {
          // Ignore failed cleanup attempts and try the next observable.
        }
      }
      continue;
    }

    if (typeof result === "function") {
      return result as Disposer;
    }

    if (
      result &&
      typeof result === "object" &&
      typeof (result as { remove?: RemoveFunction }).remove === "function"
    ) {
      const remove = (result as { remove?: RemoveFunction }).remove;
      return () => {
        remove?.(callback);
      };
    }

    if (typeof obs.remove === "function") {
      return () => {
        obs.remove?.(callback);
      };
    }

    if (typeof obs.removeObserver === "function") {
      return () => {
        obs.removeObserver?.(callback);
      };
    }

    return () => {};
  }

  return null;
}

export function attachLimitedOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  minDistance: number,
  maxDistance: number
): () => void {
  const [lower, upper] = normalizeLimits(minDistance, maxDistance);

  const clampRadius = (value: number): number => {
    if (Number.isNaN(value)) return lower;
    if (value === Infinity) return Number.isFinite(upper) ? upper : lower;
    if (value === -Infinity) return lower;
    if (value < lower) return lower;
    if (value > upper) return upper;
    return value;
  };

  const previousLowerRadiusLimit = camera.lowerRadiusLimit;
  const previousUpperRadiusLimit = camera.upperRadiusLimit;

  let disposed = false;

  const enforce = (): void => {
    if (disposed) return;

    const current = camera.radius;
    const next = clampRadius(current);
    if (next !== current) {
      camera.radius = next;
    }

    if (!Number.isFinite(camera.inertialRadiusOffset)) {
      camera.inertialRadiusOffset = 0;
    }

    // Prevent inertia from repeatedly trying to push past the range limits.
    if (camera.radius === upper && camera.inertialRadiusOffset > 0) {
      camera.inertialRadiusOffset = 0;
    }
    if (camera.radius === lower && camera.inertialRadiusOffset < 0) {
      camera.inertialRadiusOffset = 0;
    }

    camera._clampToLimits?.();
  };

  const restoreLimits = (): void => {
    if (camera.lowerRadiusLimit === lower) {
      camera.lowerRadiusLimit = previousLowerRadiusLimit;
    }
    if (camera.upperRadiusLimit === upper) {
      camera.upperRadiusLimit = previousUpperRadiusLimit;
    }
  };

  // Bring the camera inside the requested range immediately.
  camera.lowerRadiusLimit = lower;
  camera.upperRadiusLimit = upper;
  enforce();

  let disposeLimits: Disposer = () => {};
  try {
    if (typeof setCameraLimits === "function") {
      const raw = setCameraLimits(
        camera,
        {
          lowerRadiusLimit: lower,
          upperRadiusLimit: upper,
        },
        scene
      );
      if (typeof raw === "function") {
        disposeLimits = raw;
      }
    }
  } catch (error) {
    safeCall(disposeLimits);
    restoreLimits();
    throw error;
  }

  let disposeControls: Disposer = () => {};
  try {
    if (typeof attachControl === "function") {
      const raw = attachControl(camera, canvas, scene);
      if (typeof raw === "function") {
        disposeControls = raw;
      }
    }
  } catch (error) {
    safeCall(disposeLimits);
    restoreLimits();
    throw error;
  }

  // Re-enforce after attaching controls in case setup touched the camera.
  enforce();

  // If Babylon Lite exposes a render-loop observable, use it as well.
  let observerDispose: Disposer | null = null;
  try {
    observerDispose = registerRenderObserver(scene, enforce);
  } catch {
    observerDispose = null;
  }

  // Backup per-frame enforcement that we can always cancel ourselves.
  let frameId = 0;
  let rafScheduled = false;

  const raf =
    typeof globalThis.requestAnimationFrame === "function"
      ? (globalThis.requestAnimationFrame as unknown as FrameScheduler)
      : null;
  const cancelRaf =
    typeof globalThis.cancelAnimationFrame === "function"
      ? (globalThis.cancelAnimationFrame as unknown as FrameCanceller)
      : null;

  if (raf) {
    const loop = (): void => {
      if (disposed) return;
      enforce();
      frameId = raf(loop);
    };

    frameId = raf(loop);
    rafScheduled = true;
  }

  return (): void => {
    if (disposed) return;
    disposed = true;

    if (cancelRaf && rafScheduled) {
      try {
        cancelRaf(frameId);
      } catch {
        // Ignore cancel errors; disposed already prevents re-scheduling.
      }
    }

    safeCall(observerDispose);
    safeCall(disposeControls);
    safeCall(disposeLimits);
    restoreLimits();
  };
}
