import {
    createClusteredPointLight,
    markClusteredLightContainerDirty,
} from "@babylonjs/lite";
import type { ClusteredLightContainer, ClusteredPointLight, SceneContext } from "@babylonjs/lite";

/**
 * Adds one warm street lamp to a clustered light container that is already
 * registered on `scene`. Existing lamps are left untouched (the new lamp is
 * appended, so their indices do not change). The change is flagged dirty so
 * the scene's clustered light updater picks it up from the next frame.
 */
export function addLamp(
    scene: SceneContext,
    lamps: ClusteredLightContainer,
    position: [number, number, number],
    reach: number,
): ClusteredPointLight {
    if (scene._clusteredLightContainer !== lamps) {
        throw new Error("addLamp: the container is not registered on this scene");
    }

    const lamp = createClusteredPointLight(lamps, {
        position,
        diffuse: [1, 0.85, 0.6],
        range: reach,
        intensity: 1,
    });

    // Make sure the lamp is in the container's list even if the factory does not push it.
    if (!lamps.pointLights.includes(lamp)) {
        lamps.pointLights.push(lamp);
    }

    // Tell the renderer the container changed so the new lamp is uploaded.
    markClusteredLightContainerDirty(lamps);

    return lamp;
}
