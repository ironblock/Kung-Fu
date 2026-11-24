import { createClusteredPointLight, markClusteredLightContainerDirty } from "@babylonjs/lite";
import type { ClusteredLightContainer, ClusteredPointLight, SceneContext } from "@babylonjs/lite";

/**
 * Adds one warm street lamp to `lamps`, the clustered light container that is
 * already registered on `scene`, and returns it.
 *
 * The lamp goes into the existing container rather than a new one: a scene
 * holds a single clustered light container, so registering another would
 * replace the one that lights the lamps placed so far.
 */
export function addLamp(
    scene: SceneContext,
    lamps: ClusteredLightContainer,
    position: [number, number, number],
    reach: number,
): ClusteredPointLight {
    const lamp = createClusteredPointLight(lamps, {
        // Fresh arrays, so the lamp shares nothing with the caller's array
        // (e.g. a reused pick result) or with other lamps.
        position: [position[0], position[1], position[2]],
        diffuse: [1, 0.85, 0.6],
        range: reach,
        intensity: 1,
    });

    // The declarations don't say whether createClusteredPointLight puts the
    // light into the container itself. Make sure it is there exactly once.
    if (!lamps.pointLights.includes(lamp)) {
        lamps.pointLights.push(lamp);
    }

    // The container is already on the GPU, so flag it as changed. Its light
    // data and clusters are then rebuilt for the next frame, keeping the lamps
    // already there and adding the new one.
    markClusteredLightContainerDirty(lamps);

    return lamp;
}
