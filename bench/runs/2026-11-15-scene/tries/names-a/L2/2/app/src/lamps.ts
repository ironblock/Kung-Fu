import {
    createClusteredPointLight,
    markClusteredLightContainerDirty,
} from "@babylonjs/lite";
import type { ClusteredLightContainer, ClusteredPointLight, SceneContext } from "@babylonjs/lite";

const LAMP_COLOR: [number, number, number] = [1, 0.85, 0.6];
const LAMP_INTENSITY = 1;

/**
 * Adds one warm point lamp to a clustered light container that is already
 * registered on `scene`. The lamp lights everything within `reach` of `position`.
 *
 * The container is marked dirty after the change so the clustered light GPU
 * data is rebuilt, so the new lamp is lighting the scene from the next frame on.
 * Existing lamps are not modified.
 */
export function addLamp(
    scene: SceneContext,
    lamps: ClusteredLightContainer,
    position: [number, number, number],
    reach: number,
): ClusteredPointLight {
    const light = createClusteredPointLight(lamps, {
        position: [position[0], position[1], position[2]],
        diffuse: [LAMP_COLOR[0], LAMP_COLOR[1], LAMP_COLOR[2]],
        range: reach,
        intensity: LAMP_INTENSITY,
    });

    // Guarantee the returned lamp is in the container, in case the factory does not add it.
    if (!lamps.pointLights.includes(light)) {
        lamps.pointLights.push(light);
    }

    markClusteredLightContainerDirty(lamps);
    return light;
}
