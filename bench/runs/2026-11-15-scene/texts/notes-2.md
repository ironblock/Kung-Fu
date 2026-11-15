# Notes on how Babylon Lite 1.39.0 behaves when building a scene

1. removeFromScene disposes a mesh that leaves its last scene: after await waitForGpuResourceRetirements(engine), addToScene(mesh) throws and its buffers are destroyed unless a cloneTransformNode clone shares them. Hide with setMeshVisible.
2. addToScene adds a node's descendants by walking its children arrays and sets each child's parent. Assigning child.parent does not push the child into children, so addToScene(parent) skips it; setParent(child, parent) updates both.
3. Creating a shadow generator does not attach it, and addToScene(scene, generator) does nothing (scene.shadowGenerators stays empty). Set light.shadowGenerator = generator; the shadow task finds generators only there.
4. A shadow generator draws no shadow map until setShadowTaskCasterMeshes(generator, meshes) lists its casters; there is no default caster list, and receiveShadows does not make a mesh cast.
5. registerScene installs no shadow pass. A scene with shadows must be registered with registerSceneWithShadowSupport, which adds the frame-graph task named "shadow".
6. Directional ESM/PCF shadows keep only casters orthoMinZ..orthoMaxZ (defaults 1, 10000) along direction from the light's world position (light.position, default (0,0,0), moved by parents), not -direction. Put it behind the casters.
7. Turn fog on with setFog(scene, config); a plain scene.fog assignment never reaches the shaders. After setFog, a new object assigned to scene.fog is uploaded, but an in-place edit (scene.fog.start = 7) is not uploaded by itself.
8. After upload, plain writes to intensity, diffuse, specular, range, exponent, diffuseColor or groundColor wait for the light's next tracked change: setLightIntensity, setLightDiffuseColor (throws on hemispheric), position, direction, angle.
9. rotation is an Euler view of rotationQuaternion (never null) composed as qx*qy*qz, not Babylon.js's qy*qx*qz; they agree when rotation.x or rotation.y is 0 and differ e.g. at (0.7, 0.4, 0.2). Writing either updates the other.
10. Shadow receiving is fixed when a Standard mesh is built: a light.shadowGenerator set after registerSceneWithShadowSupport reaches no mesh, and a receiveShadows change no built mesh, until await rebuildSceneRenderables(scene).
11. Call setFog before registerScene: Standard meshes built without fog keep fog-free shaders after a later setFog, until await rebuildSceneRenderables(scene).
12. onBeforeRender puts the new callback at the front: callbacks run in reverse order of registration, the last registered first.
13. removeFromScene(node) also removes every descendant reached through children (meshes and lights) and sets parent = null on the node and on each of them, but leaves the children arrays as they were.
14. removeFromScene(child) does not take the child out of its parent's children, so a later addToScene(parent) adds it again (and throws if it was a mesh already disposed). Call setParent(child, null) first.
15. Shape factories (createBox, createSphere, createGround, ...) take the engine first, name the mesh after its shape and leave material null (the line factories set a line material); a mesh added without a material gets no renderable.
16. All materials share one lights buffer of MAX_LIGHTS = 16 lights per scene (not 4 per material); lights after the 16th in scene.lights are ignored. setMaxLights(n) raises the cap for light buffers built afterwards.
17. removeThinInstance(mesh, i) swap-removes: the last instance's matrix is copied into slot i, so the instance that was last now has index i. Colors are not moved: slot i keeps the removed instance's color.
18. cloneTransformNode names the copy name + "_clone" (children too), gives it parent null, and shares material, geometry and the thinInstances object: adding an instance to the clone adds it to the source.
19. setMeshVisible(node, v) writes v to node.visible and to every descendant, overwriting their own values. It does not switch a light off: a hidden light is still uploaded with the scene's lights.
20. addToScene(scene, camera) always makes that camera scene.camera, replacing the active one. removeFromScene of the active camera sets scene.camera to null; it does not fall back to another camera.
21. addToScene does not check membership: adding the same mesh or light twice lists it twice in scene.meshes or scene.lights, and each removeFromScene takes out one entry.
22. A light is a scene node: its own and its parents' rotations turn its direction, uniform scaling does not but non-uniform scaling does, and point and spot positions come from the world matrix, so a parented light moves with its parent.
23. addToScene right after removeFromScene does not throw, but the queued disposal still runs: the mesh stays in scene.meshes with _disposed true and its buffers destroyed unless a cloneTransformNode clone shares them. Create a new mesh.
24. setThinInstances(mesh, matrices, count) keeps your array, not a copy. Writing into it later uploads nothing until flushThinInstances(mesh) or setThinInstanceCount; setThinInstanceMatrix(mesh, i, m) uploads only slot i.
25. Negative scaling leaves a mesh's winding as is until enableMirroredMeshes has been awaited for any scene (its first call installs for all scenes); after that a procedural mesh with a negative world determinant gets frontFace "cw".
26. Light filters: a non-empty includedOnlyMeshes lights only those meshes minus excludedMeshes and ignores both ID sets; otherwise excludedMeshes, then includedOnlyMeshIds (beats excludedMeshIds; meshes with no id unlit) apply.
27. onBeforeRender returns nothing and has no remove function: a callback runs every frame until disposeScene, even after what it animates is removed. Take one out by splicing it from scene._beforeRender.
28. When scene.fixedDeltaMs > 0, every onBeforeRender callback receives fixedDeltaMs instead of the frame's measured delta. It starts at 0, which passes the real delta.
29. worldMatrix is recomputed on read whenever the node or any ancestor changed, so it is current right after a position, rotation, scaling or parent write; no extra call is needed.
30. On a mesh with no thin instances, setThinInstanceCount is a silent no-op, while setThinInstanceMatrix, removeThinInstance, flushThinInstances and setThinInstanceColors throw TypeError. Create them with addThinInstance or setThinInstances.
31. addThinInstance on a mesh without instances allocates 16 slots; when they are full it copies into a new array twice the size, so a reference to thinInstances.matrices taken earlier goes stale.
32. removeFromScene(light) sets light.shadowGenerator to undefined and drops the generator from scene.shadowGenerators, but destroys none of its textures; removeFromScene(generator) unlinks it from its light, which stays in the scene.
33. setShadowGeneratorEnabled(generator, false) stops rendering its shadow map and uploads darkness 1 (no shadow) for receivers, keeping its resources; true renders again with its own darkness.
34. A directional ESM/PCF shadow map covers only the box of the caster meshes' bounds seen from the light, padded by 10% on each side; receivers outside that box fall outside the map.
35. disposeScene disposes at once every mesh that was in no other scene; those meshes can no longer be added to any scene.
36. removeFromScene on a mesh that is in no scene at all still disposes it. On a mesh held only by other scenes it does not dispose it, but sets its parent to null and also removes its children (disposing those in no scene).
