# Recipes for building a scene with Babylon Lite 1.39.0

## 1. Get a mesh drawn in a registered scene

```ts
const box = createBox(engine, 2);
box.material = createStandardMaterial();
addToScene(scene, box);
createDefaultCamera(scene); // after the meshes are added
await registerScene(scene);
```

- Without box.material (factories leave it null) the mesh is added and registered with no error and is never drawn.
- Without any camera the mesh is still drawn but the scene uniforms (view-projection, fog) are never written and stay zero.
- createDefaultCamera called before the meshes are added frames nothing (radius 1 at the origin) and does not refit later.

## 2. Make a directional light cast a mesh's shadow onto the ground

```ts
const sun = createDirectionalLight([0, -1, 0.3]);
addToScene(scene, sun);
const sg = createPcfDirectionalShadowGenerator(engine, sun);
sun.shadowGenerator = sg;
setShadowTaskCasterMeshes(sg, [box]);
ground.receiveShadows = true;
await registerSceneWithShadowSupport(scene);
```

- Without sun.shadowGenerator = sg (creating sg does not set it, nor does addToScene(scene, sg)) no shadow map is drawn and the ground draws unshadowed.
- Without setShadowTaskCasterMeshes no shadow pass runs; only meshes in that list cast.
- receiveShadows set after registration is ignored: the ground keeps drawing without shadow.
- With registerScene instead of registerSceneWithShadowSupport no shadow pass runs.

## 3. Group meshes under a node to move, hide and remove them together

```ts
const group = createTransformNode("group", 2, 0, 0);
setParent(box, group); // keeps box's world position
addToScene(scene, group); // adds box as well
group.position.x = 4; // box follows
setMeshVisible(group, false); // hides box too
removeFromScene(scene, group); // removes box too
```

- With box.parent = group instead of setParent, box keeps its local position and follows, but is not put in group.children, so addToScene, setMeshVisible and removeFromScene on the group do not reach it.
- Adding box yourself as well as the group puts it in scene.meshes twice and draws it twice.

## 4. Hide a mesh for a while and show it again

```ts
setMeshVisible(mesh, false);
// later
setMeshVisible(mesh, true);
```

- With removeFromScene instead, the mesh is disposed: its GPU buffers are destroyed once the next frame is submitted, and addToScene of it then throws ("cannot be added: it was disposed"). Added back sooner, it does not throw, but its buffers are destroyed all the same and it stays in the draw list with them: create it again.

## 5. Change a light's brightness or colour while the scene runs

```ts
setLightIntensity(lamp, 3);
setLightDiffuseColor(lamp, [1, 0, 0]);
```

- Plain writes (lamp.intensity = 3, lamp.diffuse[1] = 0, lamp.range = 5) are not uploaded until a light in the scene (this one or another) moves or gets a setLight* call, which rewrites the whole lights buffer; a later setLightIntensity with the value already written does nothing.
- setLightDiffuseColor on a hemispheric light throws a TypeError: its colour fields are diffuseColor and groundColor, not diffuse.

## 6. Draw many copies of one mesh with thin instances and edit them

```ts
const m = new Float32Array(3 * 16);
m.set(createTranslationMat4(1, 0, 0), 0); // one 4x4 per 16 floats
setThinInstances(box, m, 3); // keeps m, until an add
setThinInstanceColors(box, new Float32Array(4 * 4).fill(1)); // room for 4
addToScene(scene, box);
m[12] = 10; flushThinInstances(box); // after an in-place edit
removeThinInstance(box, 0);
```

- Without flushThinInstances an in-place edit of m is not uploaded until the next addThinInstance or removeThinInstance. addThinInstance copies into a new array: edit box.thinInstances.matrices after it, as edits of m are then lost.
- removeThinInstance(box, i) moves the last instance into slot i, so that instance's index changes.
- setThinInstanceColor before setThinInstanceColors throws a TypeError; instances added beyond the colour array's length get no colour, silently.

## 7. Add fog and change it while the scene runs (Standard material)

```ts
// mode 1 exp, 2 exp2, 3 linear
setFog(scene, { mode: 3, start: 2, end: 20, density: 0, color: [0.5, 0.5, 0.5] });
await registerScene(scene);
setFog(scene, { ...scene.fog!, end: 50 }); // a new object
```

- scene.fog = {...} instead of setFog builds the fog shader code but leaves the fog uniforms at 0 (mode 0).
- setFog first called after registerScene writes the uniforms, but the meshes' pipelines have no fog code.
- An in-place edit (scene.fog.end = 50) is not uploaded while the camera stays still; it is uploaded at the next camera move.

## 8. Keep one light from lighting one mesh

```ts
lamp.excludedMeshes = new Set([box]); // before registerScene
await registerScene(scene);
// changing it later: set it, then move the mesh
lamp.excludedMeshes = new Set([box]);
box.position.z += 0.001;
```

- Set after registration, the exclusion is not applied (the mesh stays lit by that light) until the mesh moves or a light is added to or removed from the scene.

## 9. Give thin instances to a mesh that is already drawing

```ts
addThinInstance(box, createTranslationMat4(1, 0, 0));
addThinInstance(box, createTranslationMat4(2, 0, 0));
box.material = createStandardMaterial(); // a new material rebuilds it
```

- Without assigning a new material object (box.material = box.material is not enough) the mesh keeps drawing one plain copy.
- A new mesh given thin instances before addToScene into a running scene draws them once its build has run, not on the first frame.

## 10. Switch shadows off and on while the scene runs

```ts
setShadowGeneratorEnabled(sg, false); // no shadow pass, darkness 1
setShadowGeneratorEnabled(sg, true);
```

- removeFromScene(scene, sg) instead unlinks it: sun.shadowGenerator becomes undefined and the shadow pass stops.
- A generator first created and linked after registerSceneWithShadowSupport has its map drawn, but receivers built earlier never sample it.

## 11. Make a mesh added later cast a shadow

```ts
const casters = [box];
setShadowTaskCasterMeshes(sg, casters);
await registerSceneWithShadowSupport(scene);
addToScene(scene, ball);
casters.push(ball); // or setShadowTaskCasterMeshes(sg, [box, ball])
```

- With addToScene alone the new mesh is drawn in colour but not into the shadow map.

## 12. Use more than 16 lights in a scene

```ts
setMaxLights(20); // before building the scene
for (const p of spots) addToScene(scene, createPointLight(p));
await registerScene(scene);
```

- Without setMaxLights, lights after the 16th in scene.lights are left out of the lights buffer and light nothing, with no error.
