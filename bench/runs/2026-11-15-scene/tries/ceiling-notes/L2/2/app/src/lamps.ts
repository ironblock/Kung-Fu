import { createClusteredPointLight, markClusteredLightContainerDirty } from "@babylonjs/lite";
import type { ClusteredLightContainer, ClusteredPointLight, SceneContext } from "@babylonjs/lite";

const LAMP_COLOUR: readonly [number, number, number] = [1, 0.85, 0.6];
const LAMP_INTENSITY = 1;

/**
 * Adds one warm street lamp to `lamps`, the clustered light container that is
 * already registered on `scene`, and returns it.
 *
 * The lamp goes into the existing container. Registering a second container
 * would replace the first one (a scene holds a single clustered container),
 * and the lamps already placed would stop lighting the scene.
 */
export function addLamp(
    scene: SceneContext,
    lamps: ClusteredLightContainer,
    position: [number, number, number],
    reach: number,
): ClusteredPointLight {
    const lamp = createClusteredPointLight(lamps, {
        // Copy the arrays so the lamp does not share them with the caller (a click
        // handler may reuse its position array) or with the other lamps.
        position: [position[0], position[1], position[2]],
        diffuse: [LAMP_COLOUR[0], LAMP_COLOUR[1], LAMP_COLOUR[2]],
        range: reach,
        intensity: LAMP_INTENSITY,
    });

    // createClusteredPointLight takes the container, so it should already have
    // added the lamp. In case it has not, add it here so the lamp is in
    // lamps.pointLights, but never add it twice.
    if (!lamps.pointLights.includes(lamp)) {
        lamps.pointLights.push(lamp);
    }

    // The container is already on the GPU. Bump its version so the next frame
    // uploads the new light list (old lamps plus this one) and re-bins it into
    // the clusters.
    markClusteredLightContainerDirty(lamps);

    return lamp;
}
