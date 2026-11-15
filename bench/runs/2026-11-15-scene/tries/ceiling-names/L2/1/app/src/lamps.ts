import { createClusteredPointLight, markClusteredLightContainerDirty } from "@babylonjs/lite";
import type { ClusteredLightContainer, ClusteredPointLight, SceneContext } from "@babylonjs/lite";

const LAMP_COLOR: readonly [number, number, number] = [1, 0.85, 0.6];
const LAMP_INTENSITY = 1;

/**
 * Adds one warm street lamp to `lamps`, a clustered light container that is
 * already registered on `scene` and being rendered.
 *
 * The lamp is appended after the existing lights, so the lights already in the
 * container keep their order and values. The container is then marked dirty,
 * so the scene uploads the changed light list on the next frame.
 *
 * `scene` is not used here: the light goes in through the container that is
 * already registered on it. The parameter keeps the call site explicit.
 */
export function addLamp(
    scene: SceneContext,
    lamps: ClusteredLightContainer,
    position: [number, number, number],
    reach: number,
): ClusteredPointLight {
    void scene;

    if (!(reach > 0)) {
        throw new RangeError(`addLamp: reach must be a positive number, got ${reach}`);
    }

    // Copy the caller's arrays. A click handler that reuses one position vector
    // must not move lamps that were placed earlier, and lamps must not share
    // one colour array.
    const lamp = createClusteredPointLight(lamps, {
        position: [position[0], position[1], position[2]],
        diffuse: [LAMP_COLOR[0], LAMP_COLOR[1], LAMP_COLOR[2]],
        range: reach,
        intensity: LAMP_INTENSITY,
    });

    // The declarations don't say whether createClusteredPointLight adds the
    // light to the container itself. Make sure it is there, exactly once.
    if (!lamps.pointLights.includes(lamp)) {
        lamps.pointLights.push(lamp);
    }

    // The container has already been registered and turned into GPU state.
    // Mark it changed so the next frame picks up the new light.
    markClusteredLightContainerDirty(lamps);

    return lamp;
}
