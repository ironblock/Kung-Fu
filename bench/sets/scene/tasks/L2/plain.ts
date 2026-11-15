import { createClusteredPointLight, markClusteredLightContainerDirty } from "@babylonjs/lite";
import type { ClusteredLightContainer, ClusteredPointLight, SceneContext } from "@babylonjs/lite";

export function addLamp(_scene: SceneContext, lamps: ClusteredLightContainer, position: [number, number, number], reach: number): ClusteredPointLight {
    const lamp = createClusteredPointLight(lamps, { position, diffuse: [1, 0.85, 0.6], intensity: 1, range: reach });
    markClusteredLightContainerDirty(lamps);
    return lamp;
}
