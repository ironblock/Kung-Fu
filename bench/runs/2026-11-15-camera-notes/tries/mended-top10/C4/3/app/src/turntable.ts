import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

/**
 * Glides an orbit camera around its target by `turns` full turns, in the
 * direction in which alpha grows, using the library's camera-transition easing.
 * Distance (radius), height angle (beta) and the look-at point are kept as they are.
 * Resolves once alpha equals its starting value plus 2π · turns.
 */
export async function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  // Drop any pending inertial motion first, so the starting pose is the one
  // the camera will actually hold when the transition begins.
  camera.inertialAlphaOffset = 0;
  camera.inertialBetaOffset = 0;
  camera.inertialRadiusOffset = 0;
  camera.inertialPanningX = 0;
  camera.inertialPanningY = 0;

  const startAlpha = camera.alpha;
  const goalAlpha = startAlpha + 2 * Math.PI * turns;

  // The library clamps transition goals to alpha limits, which would end the
  // spin short of the promised angle. Refuse rather than arrive at the wrong pose.
  if (
    (camera.lowerAlphaLimit !== undefined && goalAlpha < camera.lowerAlphaLimit) ||
    (camera.upperAlphaLimit !== undefined && goalAlpha > camera.upperAlphaLimit)
  ) {
    throw new Error("spinAround: target alpha lies outside the camera's alpha limits");
  }

  await interpolateArcRotateCamera(camera, scene, {
    alpha: goalAlpha,
    beta: camera.beta,
    radius: camera.radius,
    target: { x: camera.target.x, y: camera.target.y, z: camera.target.z },
  });
}
