import {
    createClusteredPointLight,
    markClusteredLightContainerDirty,
} from "@babylonjs/lite";
import type { ClusteredLightContainer, ClusteredPointLight, SceneContext } from "@babylonjs/lite";

/**
 * Adds one warm street lamp to a clustered light container that is already
 * registered on `scene`. Existing lamps are left untouched.
 */
export function addLamp(
    scene: SceneContext,
    lamps: ClusteredLightContainer,
    position: [number, number, number],
    reach: number,
): ClusteredPointLight {
    const light = createClusteredPointLight(lamps, {
        position: [position[0], position[1], position[2]],
        diffuse: [1, 0.85, 0.6],
        range: reach,
        intensity: 1,
    });

    // Make sure the lamp is in the container's list exactly once.
    if (!lamps.pointLights.includes(light)) {
        lamps.pointLights.push(light);
    }

    // Tell the clustered lighting that its light data changed so the GPU
    // lists are rebuilt for the next frame.
    markClusteredLightContainerDirty(lamps);

    return light;
}
