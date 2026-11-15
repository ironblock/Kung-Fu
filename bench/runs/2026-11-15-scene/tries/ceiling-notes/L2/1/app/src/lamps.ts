import { createClusteredPointLight, markClusteredLightContainerDirty } from "@babylonjs/lite";
import type { ClusteredLightContainer, ClusteredPointLight, SceneContext } from "@babylonjs/lite";

/** Warm street-lamp colour. */
const LAMP_COLOR: readonly [number, number, number] = [1, 0.85, 0.6];

/**
 * Adds one warm lamp at `position`, lighting everything within `reach`, to
 * `lamps`, the clustered light container already registered on `scene`, and
 * returns it. The lamp lights the scene from the next frame on.
 *
 * The lamp goes into the existing container on purpose: a scene holds a single
 * clustered light container, so creating and registering another one would
 * replace the lamps that are already there.
 */
export function addLamp(
    scene: SceneContext,
    lamps: ClusteredLightContainer,
    position: [number, number, number],
    reach: number,
): ClusteredPointLight {
    const lamp = createClusteredPointLight(lamps, {
        // Fresh arrays, so the lamp shares none with the caller or other lamps:
        // a click handler that reuses one position array would otherwise move
        // every lamp placed so far.
        position: [position[0], position[1], position[2]],
        diffuse: [LAMP_COLOR[0], LAMP_COLOR[1], LAMP_COLOR[2]],
        range: reach,
        intensity: 1,
    });

    // The declarations don't say whether createClusteredPointLight appends to
    // the container itself; make sure the lamp is listed exactly once.
    if (!lamps.pointLights.includes(lamp)) {
        lamps.pointLights.push(lamp);
    }

    // Have the scene's clustered light data re-uploaded for the next frame.
    markClusteredLightContainerDirty(lamps);

    return lamp;
}
