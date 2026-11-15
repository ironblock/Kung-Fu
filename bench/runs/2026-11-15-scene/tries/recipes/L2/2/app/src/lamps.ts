import {
  createClusteredPointLight,
  markClusteredLightContainerDirty,
} from "@babylonjs/lite";
import type { ClusteredLightContainer, ClusteredPointLight, SceneContext } from "@babylonjs/lite";

/**
 * Adds one warm street lamp to a clustered light container that is already
 * registered on `scene`, and returns it.
 *
 * The lamp is appended to the end of `lamps.pointLights`, so the indices of
 * existing lamps do not change. The container is marked dirty so the lamp is
 * uploaded on the next frame.
 */
export function addLamp(
  scene: SceneContext,
  lamps: ClusteredLightContainer,
  position: [number, number, number],
  reach: number,
): ClusteredPointLight {
  const lamp = createClusteredPointLight(lamps, {
    position: [position[0], position[1], position[2]],
    diffuse: [1, 0.85, 0.6],
    range: reach,
    intensity: 1,
  });

  // Make sure the lamp is in the container's list exactly once, whether or not
  // createClusteredPointLight already appended it.
  if (!lamps.pointLights.includes(lamp)) {
    lamps.pointLights.push(lamp);
  }

  markClusteredLightContainerDirty(lamps);
  return lamp;
}
