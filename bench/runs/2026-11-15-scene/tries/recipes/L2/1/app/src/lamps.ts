import {
    createClusteredPointLight,
    markClusteredLightContainerDirty,
} from "@babylonjs/lite";
import type { ClusteredLightContainer, ClusteredPointLight, SceneContext } from "@babylonjs/lite";

/**
 * Adds one warm lamp to `lamps`, the clustered light container already
 * registered on `scene`, and returns it.
 *
 * The container's array identity is kept (no reassignment of `pointLights`),
 * so lamps added earlier keep their entries and their light. The container is
 * marked dirty so the new lamp is uploaded from the next frame on.
 */
export function addLamp(
    scene: SceneContext,
    lamps: ClusteredLightContainer,
    position: [number, number, number],
    reach: number,
): ClusteredPointLight {
    // The scene is already known through the container registration; it is
    // part of the required signature and is not otherwise needed here.
    void scene;

    const lamp = createClusteredPointLight(lamps, {
        position: [position[0], position[1], position[2]],
        diffuse: [1, 0.85, 0.6],
        range: reach,
        intensity: 1,
    });

    // Make sure the lamp is one of pointLights whether or not the factory
    // already appended it, without adding it twice.
    if (!lamps.pointLights.includes(lamp)) {
        lamps.pointLights.push(lamp);
    }

    // Tell the renderer the light list changed so the new lamp is picked up.
    markClusteredLightContainerDirty(lamps);

    return lamp;
}
