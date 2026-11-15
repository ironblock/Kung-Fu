# L2: where a late lamp is decided

**The behaviour.** A clustered light container's GPU state is built with a fixed light capacity when the container is registered; adding a light to the container afterwards makes the next frame's refresh throw "light count cannot grow after GPU state creation", so a lamp added late needs the container registered again (which builds new state).

**What the reader would write, and why.** `createClusteredPointLight(lamps, {...})`, perhaps followed by `markClusteredLightContainerDirty(lamps)`. In Babylon.js, `ClusteredLightContainer.addLight` works at any time and the container re-bins its lights each frame. In `names/light/clustered.d.ts` the container's `pointLights` is a plain array, `createClusteredPointLight` takes the container and pushes into it, and `markClusteredLightContainerDirty` reads as the step that makes the change show. Nothing in the types says the light count is frozen. The frame after the call throws, and the GPU never holds the new lamp.

**The code that decides it** (`babylon-lite/packages/babylon-lite/src/light/clustered.ts`):
- lines 286-301: `buildClusteredLightGpuState` sizes the light texture and the tile masks from the lights present at that moment;
- lines 350 and 362-364: `refresh` throws when the live count needs more room than that;
- lines 193-199: `addClusteredLightContainer` builds fresh state and points the scene's per-frame updater at it, which is why registering again works;
- lines 139-149: `createClusteredPointLight` only pushes into the array and bumps the version.

**The makers' unit test:** none. (`tests/lite/unit/clustered-light.test.ts`, "rebuilds topology and light count when lights are removed directly", covers shrinking only.)

**comment: yes.** On `createClusteredSpotLight`: "All lights must be created before {@link addClusteredLightContainer}: the GPU state bakes both the light capacity and the point/spot data layout." No comment on `createClusteredPointLight`, which this task uses, says it.
