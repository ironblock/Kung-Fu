import type { ClusteredLightContainer, ClusteredPointLight, SceneContext } from "@babylonjs/lite";

// Adds one warm street lamp to `lamps`, the clustered container already registered on `scene`.
// The returned lamp is the same object that was pushed onto lamps.pointLights.
//
// Unverified: the Babylon Lite library is not on this machine, so the property names below
// (position, diffuse, intensity, range) follow the naming in scene-notes.md and were not checked
// against the ClusteredPointLight type. Nor is there a known call to refresh the clustered
// container after a lamp is added, so none is made here.
export function addLamp(
    scene: SceneContext,
    lamps: ClusteredLightContainer,
    position: [number, number, number],
    reach: number
): ClusteredPointLight {
    const lamp: ClusteredPointLight = {
        position: [position[0], position[1], position[2]],
        diffuse: [1, 0.85, 0.6],
        intensity: 1,
        range: reach,
    };
    lamps.pointLights.push(lamp);
    return lamp;
}
