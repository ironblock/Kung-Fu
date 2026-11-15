import {
    createClusteredPointLight,
    markClusteredLightContainerDirty,
} from "@babylonjs/lite";
import type { ClusteredLightContainer, ClusteredPointLight, SceneContext } from "@babylonjs/lite";

const LAMP_COLOUR: [number, number, number] = [1, 0.85, 0.6];
const LAMP_INTENSITY = 1;

/**
 * Adds one warm street lamp to a clustered light container that is already
 * registered on `scene`. Existing lamps keep their indices in `pointLights`.
 * Returns the new lamp, which is one of `lamps.pointLights`.
 */
export function addLamp(
    scene: SceneContext,
    lamps: ClusteredLightContainer,
    position: [number, number, number],
    reach: number,
): ClusteredPointLight {
    if (scene._clusteredLightContainer !== lamps) {
        throw new Error("addLamp: the container is not the one registered on this scene");
    }

    const lamp = createClusteredPointLight(lamps, {
        position: [position[0], position[1], position[2]],
        diffuse: [LAMP_COLOUR[0], LAMP_COLOUR[1], LAMP_COLOUR[2]],
        range: reach,
        intensity: LAMP_INTENSITY,
    });

    // Make sure the GPU-side light data is rebuilt from the updated list on the next frame.
    markClusteredLightContainerDirty(lamps);

    if (!lamps.pointLights.includes(lamp)) {
        throw new Error("addLamp: the new lamp is not in the container's pointLights");
    }
    return lamp;
}
