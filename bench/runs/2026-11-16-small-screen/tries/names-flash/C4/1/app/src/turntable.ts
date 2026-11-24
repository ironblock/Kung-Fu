import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;

export async function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number
): Promise<void> {
  // The product-page tour is specified to always rotate in the direction in
  // which alpha grows. The app passes positive values such as 0.75, 1, and 2;
  // treating a negative value as a magnitude preserves that invariant.
  const magnitude = Math.abs(turns);
  const startAlpha = camera.alpha;
  const targetAlpha = startAlpha + TWO_PI * magnitude;

  if (
    !Number.isFinite(magnitude) ||
    magnitude === 0 ||
    !Number.isFinite(startAlpha) ||
    !Number.isFinite(targetAlpha)
  ) {
    return;
  }

  const pathMin = Math.min(startAlpha, targetAlpha);
  const pathMax = Math.max(startAlpha, targetAlpha);

  const savedLowerAlphaLimit = camera.lowerAlphaLimit;
  const savedUpperAlphaLimit = camera.upperAlphaLimit;

  // Temporarily remove alpha clamping so a multi-turn tour cannot be stopped
  // short or clamped into a discontinuity.
  camera.lowerAlphaLimit = -Infinity;
  camera.upperAlphaLimit = Infinity;

  // Clear residual orbit inertia so the library transition is the only thing
  // moving alpha while the promise is pending.
  camera.inertialAlphaOffset = 0;

  try {
    await interpolateArcRotateCamera(
      camera,
      scene as unknown as Parameters<typeof interpolateArcRotateCamera>[1],
      {
        alpha: targetAlpha,
        beta: camera.beta,
        radius: camera.radius,
        // Omit target so the camera keeps looking at the same point.
      }
    );

    // The library easing may stop very close to the goal; pin the endpoint
    // exactly before resolving.
    camera.alpha = targetAlpha;
    camera.inertialAlphaOffset = 0;
  } finally {
    // Restore original alpha limits only if they can contain the entire path.
    // Otherwise, relax them just enough to include the start/end values so the
    // camera does not jump when the promise resolves.
    const lowerCanContain =
      savedLowerAlphaLimit === undefined || savedLowerAlphaLimit <= pathMin;
    const upperCanContain =
      savedUpperAlphaLimit === undefined || savedUpperAlphaLimit >= pathMax;

    if (lowerCanContain && upperCanContain) {
      camera.lowerAlphaLimit = savedLowerAlphaLimit;
      camera.upperAlphaLimit = savedUpperAlphaLimit;
    } else {
      camera.lowerAlphaLimit = lowerCanContain ? savedLowerAlphaLimit : pathMin;
      camera.upperAlphaLimit = upperCanContain ? savedUpperAlphaLimit : pathMax;
    }
  }
}
