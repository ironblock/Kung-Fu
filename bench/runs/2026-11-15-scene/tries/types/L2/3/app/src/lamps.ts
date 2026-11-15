import {
    addClusteredLightContainer,
    createClusteredPointLight,
    markClusteredLightContainerDirty,
} from "@babylonjs/lite";
import type { ClusteredLightContainer, ClusteredPointLight, SceneContext } from "@babylonjs/lite";

/**
 * Add one warm street lamp to a clustered light container that is already registered on `scene`.
 *
 * The container's GPU state bakes in its light capacity at registration, so a light created after
 * registration is not seen by the GPU until the container is registered again. Re-registering after
 * the lamp is created rebuilds that state with every lamp in the container, including the new one.
 *
 * @returns The new lamp, which is also `lamps.pointLights[lamps.pointLights.length - 1]`.
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

    addClusteredLightContainer(scene, lamps);
    markClusteredLightContainerDirty(lamps);

    return lamp;
}
