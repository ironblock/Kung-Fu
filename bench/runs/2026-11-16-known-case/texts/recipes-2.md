# Recipes for building a scene with Babylon Lite 1.39.0

## 1. Put a mesh on screen, before or after the scene is running

```ts
const box = createBox(engine, { size: 2 }); // box.material is null
box.material = createStandardMaterial();
addToScene(scene, box);
await registerScene(scene);
const late = createBox(engine, 1);
late.material = createStandardMaterial();
addToScene(scene, late); // after registerScene: built by the render loop over the next frames
```

- Without a material, addToScene and registerScene succeed and the mesh is in scene.meshes, but nothing is built or drawn for it; the shape factories (createBox, createSphere, createGround, ...) assign none, while createLines and the other line factories assign a line material themselves.
- Assigning the material later, even after registerScene, builds the mesh on the following frames; no second registerScene is needed.

## 2. Make a box cast a shadow from a directional light onto the ground

```ts
const sun = createDirectionalLight([0, -1, 0]);
sun.position.set(0, 20, 0); // see shadow coverage
addToScene(scene, box); addToScene(scene, ground); addToScene(scene, sun);
const sg = createPcfDirectionalShadowGenerator(engine, sun);
sun.shadowGenerator = sg;
setShadowTaskCasterMeshes(sg, [box]);
ground.receiveShadows = true;
await registerSceneWithShadowSupport(scene);
```

- Without sun.shadowGenerator = sg (creating it does not link it; addToScene(scene, sg) neither links nor lists it), no map is drawn or sampled.
- Without setShadowTaskCasterMeshes no map is drawn.
- With registerScene instead there is no shadow task: no map, ever.
- Without receiveShadows = true before registering (setting it later is not picked up), the ground does not sample the map.

## 3. Hide a mesh for a while and show it again

```ts
setMeshVisible(crate, false); // also hides everything in crate.children
setMeshVisible(crate, true);
```

- With removeFromScene instead, the mesh is retired: its children are removed with it, and after the next frame addToScene(scene, crate) throws "cannot be added" (unless another scene still holds the mesh).
- A hidden mesh is left out of createDefaultCamera's framing.

## 4. Attach a mesh to a parent so it moves, hides and is removed with it

```ts
const pivot = createTransformNode("pivot", 10, 0, 0);
setParent(wheel, pivot); // keeps wheel's world position, adds it to pivot.children
// or, keeping wheel's local position: pivot.children.push(wheel) before addToScene
addToScene(scene, pivot); // adds wheel too and sets wheel.parent
```

- With only wheel.parent = pivot, the world matrix follows pivot but pivot.children stays empty: addToScene(scene, pivot) does not add wheel, setMeshVisible(pivot, false) does not hide it, and removeFromScene(scene, pivot) leaves it in the scene.
- After children.push alone, wheel.parent is null until addToScene sets it.

## 5. Change a light's brightness or color while the scene runs

```ts
setLightIntensity(sun, 2);
setLightDiffuseColor(sun, [1, 0.5, 0]);
sun.direction.set(1, -1, 0); // position/direction .set() is tracked
spot.angle = Math.PI / 3; // full cone, radians; tracked
hemi.groundColor = [0.2, 0.2, 0.2]; // hemispheric: diffuseColor/groundColor
hemi._bumpLightVersion?.();
```

- A plain write (sun.intensity = 2, sun.diffuse = [...], sun.diffuse[0] = 1, spot.range = 10) is not uploaded: the shaders keep the old value until a tracked change uploads the lights again.
- Without _bumpLightVersion after writing a hemispheric light's colors, they are not uploaded (setLightDiffuseColor does not fit it: it has diffuseColor, not diffuse).

## 6. Keep a directional light's shadow map covering all casters, thin instances included

```ts
const dir: [number, number, number] = [0.3, -1, 0.2];
const sun = createDirectionalLight(dir);
sun.position.set(-dir[0] * 50, -dir[1] * 50, -dir[2] * 50); // back along the light, beyond every caster
// a thin-instanced caster: make its LOCAL bounds enclose every instance
trees.boundMin = [-0.5, -0.5, -0.5];
trees.boundMax = [20.5, 0.5, 0.5];
```

- The PCF and ESM maps start 1 unit in front of the light's position ((0, 0, 0) unless placed), so a caster behind it, or under 1 unit in front, gets light-space depth below 0 and is left out of the map; place the light past the farthest caster.
- The map is fitted to each caster's boundMin/boundMax through its world matrix only, so thin instances outside those bounds land outside the map; enableThinInstanceWorldBounds does not change that.

## 7. Draw many copies of a mesh and move, add or remove them

```ts
const mats = new Float32Array(16 * n); // column-major, xyz at [12..14]
setThinInstances(tree, mats, n); // keeps a reference to mats
mats[16 * i + 12] = 5; flushThinInstances(tree); // after edits
setThinInstanceMatrix(tree, i, m); // no flush needed
removeThinInstance(tree, i); // the LAST instance moves into slot i
const j = addThinInstance(tree, m); // may replace tree.thinInstances.matrices
```

- Without flushThinInstances, in-place edits are not uploaded.
- After removeThinInstance(i), the former last instance is index i; an index kept for it is stale.
- Once addThinInstance outgrows the pool it copies to a new array; edits to your old array are then not seen, so write to tree.thinInstances.matrices.
- addThinInstance on a mesh without instances starts a pool of 16.

## 8. Give a mesh that is already drawing thin instances or per-instance colors

```ts
setThinInstances(rock, mats, n); // rock was built by registerScene
setThinInstanceColors(rock, colors); // RGBA: 4 floats per instance
markMeshRenderableDirty(rock); // or: await rebuildSceneRenderables(scene)
```

- Without markMeshRenderableDirty (or rebuildSceneRenderables), a mesh built without instances never gets an instance buffer, and instance colors first set after the build are never uploaded; no error.
- Set before registerScene, or on a new mesh before it is added to a running scene, they need no extra call.

## 9. Add fog to the scene and change it later

```ts
setFog(scene, { mode: 3, density: 0, start: 10, end: 60, color: [0.5, 0.6, 0.7] }); // 1 exp, 2 exp2, 3 linear
await registerScene(scene); // fog is compiled into the shaders here
setFog(scene, { ...scene.fog!, end: 30 }); // later change: a NEW object
```

- With setFog only after registerScene, no shader has fog until await rebuildSceneRenderables(scene).
- With scene.fog = {...} instead of setFog, fog is compiled in but its uniforms are never written; mode stays 0, which the shader treats as no fog.
- Editing the fog object in place (scene.fog.end = 30) is not uploaded.

## 10. Let a light reach some meshes and not others

```ts
lamp.excludedMeshes = new Set([crate]); // mesh objects
spot.includedOnlyMeshes = new Set([statue]);
crate.id = "crate"; // id lists need mesh.id
hemi.excludedMeshIds = new Set(["crate"]);
await registerScene(scene);
// changed at runtime: also move the mesh, or add/remove a light
```

- A change to these sets after the scene is built has no effect on a mesh until its world matrix changes or a light is added to or removed from the scene.
- mesh.id is unset by default, so includedOnlyMeshIds holding mesh names leaves those meshes unlit by that light.

## 11. Switch a light's shadows off and on at runtime

```ts
setShadowGeneratorEnabled(sg, false);
setShadowGeneratorEnabled(sg, true);
// the map is not redrawn while nothing changes; to redraw every frame:
const sg2 = createPcfDirectionalShadowGenerator(engine, sun, { forceRefreshEveryFrame: true });
```

- With removeFromScene(scene, sun) instead, the generator is unlinked: sun.shadowGenerator is undefined, and adding the light back does not restore it.
- With nothing changed the map is not redrawn; a caster's world-matrix or thin-instance change, a light position/direction .set(), setLightIntensity or setLightDiffuseColor redraws it, a plain sun.intensity write does not.

## 12. Use more than 16 lights

```ts
setMaxLights(32);
await registerScene(scene); // call setMaxLights before this
```

- Without setMaxLights, lights past the 16th stay in scene.lights but are not uploaded, with no error; the cap counts the whole scene, not one material.

## 13. Run per-frame logic in a set order

```ts
onBeforeRender(scene, (ms) => {
  // physics first, then the follow camera, in one callback
});
scene.fixedDeltaMs = 1000 / 60; // optional: every callback then gets this delta
```

- Registered as separate callbacks, they run in reverse: the one registered last runs first.
- With fixedDeltaMs at 0 (the default), ms is the frame's delta in milliseconds.

## 14. Point a default camera at a thin-instanced field

```ts
setThinInstances(trees, mats, n);
enableThinInstanceWorldBounds(trees);
addToScene(scene, trees); // add everything to frame first
const cam = createDefaultCamera(scene); // also sets scene.camera
```

- Without enableThinInstanceWorldBounds, the camera frames only the prototype's own bounds at the mesh's position.
- It frames what is in scene.meshes at the call, skipping hidden meshes; meshes added later do not reframe it.

## 15. Make copies of a mesh that can be added and removed on their own

```ts
const copy = cloneTransformNode(crate) as Mesh; // "crate_clone", same geometry AND material object
copy.position.set(3, 0, 0);
addToScene(scene, copy); // cloning does not add it
```

- Cloning after the original was removed from its last scene (and a frame passed) throws "cannot be cloned"; clone first.
- Removing the original retires only it; the clone keeps the shared buffers until it too leaves its last scene.
