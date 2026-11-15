import {
    createClusteredPointLight,
    markClusteredLightContainerDirty,
} from "@babylonjs/lite";
import type { ClusteredLightContainer, ClusteredPointLight, SceneContext } from "@babylonjs/lite";

/**
 * Adds one warm street lamp to a clustered light container that is already
 * registered on `scene`. Existing lamps are left untouched; the new lamp is
 * appended to `lamps.pointLights` and the container is marked dirty so the
 * clustered light data is rebuilt for the next frame.
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

    // Guard against createClusteredPointLight having already pushed the lamp;
    // a duplicate entry would make the lamp count twice.
    if (!lamps.pointLights.includes(lamp)) {
        lamps.pointLights.push(lamp);
    }

    markClusteredLightContainerDirty(lamps);
    return lamp;
}
