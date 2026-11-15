import { createClusteredPointLight, markClusteredLightContainerDirty } from "@babylonjs/lite";
import type { ClusteredLightContainer, ClusteredPointLight, SceneContext } from "@babylonjs/lite";

/**
 * Adds one warm street lamp to `lamps`, the clustered light container that is
 * already registered on `scene`, and returns it. The returned lamp is an
 * element of `lamps.pointLights`.
 *
 * `scene` is not touched. The container is already registered, and registering
 * it again could swap out or rebuild the scene's clustered light state.
 */
export function addLamp(
    scene: SceneContext,
    lamps: ClusteredLightContainer,
    position: [number, number, number],
    reach: number,
): ClusteredPointLight {
    // Check the inputs before changing the container. A bad range or position
    // would otherwise go to the GPU and break every frame after this one.
    if (!Array.isArray(position) || position.length !== 3 || !position.every(Number.isFinite)) {
        throw new RangeError(`addLamp: position must be three finite numbers, got ${String(position)}`);
    }
    if (!Number.isFinite(reach) || reach <= 0) {
        throw new RangeError(`addLamp: reach must be a finite number greater than 0, got ${reach}`);
    }

    // Use new arrays so the lamp shares no array with the caller or with other
    // lamps. If the library keeps these arrays by reference, a later change to
    // `position` (or to another lamp's colour) cannot move or recolour this one.
    const lamp = createClusteredPointLight(lamps, {
        position: [position[0], position[1], position[2]],
        diffuse: [1, 0.85, 0.6],
        range: reach,
        intensity: 1,
    });

    // The declarations don't say if createClusteredPointLight adds the light to
    // the container. Add it only if it isn't there yet, so the lamp is in the
    // list exactly once. A second copy would make this lamp twice as bright.
    if (!lamps.pointLights.includes(lamp)) {
        lamps.pointLights.push(lamp);
    }

    // Tell the renderer the container changed, so the next frame uploads the
    // new light list. The lamps already there keep their values unchanged.
    markClusteredLightContainerDirty(lamps);

    return lamp;
}
