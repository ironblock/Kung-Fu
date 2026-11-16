# Notes on how Babylon Lite 1.39.0 behaves when building a scene

1. A later addToScene(light), light.shadowGenerator = sg or receiveShadows = true re-runs no material group builder that already ran, even after unregisterScene/registerScene; call rebuildSceneRenderables(scene).
2. A create*ShadowGenerator result renders only once light.shadowGenerator = sg, its light is in scene.lights and setShadowTaskCasterMeshes(sg, list) ran, even with []. addToScene(scene, sg) adds it to nothing, not even scene.shadowGenerators.
3. registerScene puts no shadow task in the scene's frame graph; registerSceneWithShadowSupport puts one "shadow" task first. That task is what renders the maps of light.shadowGenerator, so register a scene with shadows the second way.
4. removeFromScene from a mesh's last scene queues its disposal (waitForGpuResourceRetirements awaits it); then addToScene and cloneTransformNode throw, and an early re-add loses its buffers unless a clone shares them. Hide: setMeshVisible.
5. Plain writes to a light's intensity, diffuse, specular, range or exponent wait for the next lights UBO refill: setLightIntensity, setLightDiffuseColor, position/direction set or spot angle write on any light, or a light added or removed.
6. node.parent = p keeps the local transform and changes no children array, so addToScene, setMeshVisible and cloneTransformNode on p skip that child. setParent(child, p) adds it to p.children, keeping its world transform, unless parent was p.
7. computeDirectionalLightMatrix spans depth orthoMinZ..orthoMaxZ (default 1..10000) ahead of the light's world position along direction (if unparented, light.position: [0,0,0]); casters behind it or within 1 are out. X/Y fit casters +10%.
8. Fog uniforms are written only after a first setFog(scene, config); before it, assigning scene.fog writes nothing. After it, a new scene.fog object is written at once, but an in-place edit waits until the camera or aspect changes.
9. addToScene walks entity.children recursively, adds each child and sets its parent to the holder; a TransformNode itself goes in no scene list. Pushing to children alone does not parent the child until addToScene.
10. removeFromScene also removes everything in entity.children, recursively, and sets parent to null on the entity and each removed node; the children arrays are not changed.
11. createBox, createSphere, createGround, createPlane and other shape factories take no name: mesh.name is the shape, id undefined, material null, receiveShadows false (not so createLines). boundMin/boundMax are local, ignoring transforms.
12. A mesh with no id (every factory mesh) is never excluded by excludedMeshIds, and while includedOnlyMeshes is empty it is unlit by a light whose includedOnlyMeshIds is non-empty; set mesh.id or use excludedMeshes/includedOnlyMeshes.
13. includedOnlyMeshes/excludedMeshes are checked before the ID sets, and a mesh in both object sets is unlit; with the ID sets, a mesh in both includedOnlyMeshIds and excludedMeshIds is lit.
14. addToScene with a camera always makes it scene.camera, replacing the previous one. removeFromScene of the active camera sets scene.camera to null with no fallback; removing another camera leaves it.
15. onBeforeRender puts the callback first, so callbacks run newest first. Each gets scene.fixedDeltaMs when it is above 0, else the frame's delta.
16. computeDirectionalLightMatrix fits each caster's boundMin/boundMax under its worldMatrix only, not its thin-instance matrices: instances far from the prototype fall off the map unless boundMin/boundMax are widened to cover them.
17. setThinInstances and setThinInstanceColors keep the passed arrays; capacity is count. addThinInstance past capacity moves to a new doubled array (first: 16), so later writes to your array are lost; at capacity 0 it throws RangeError.
18. Writes made straight into thinInstances.matrices are not uploaded until flushThinInstances(mesh). setThinInstanceMatrix(mesh, i, m) needs no flush but marks only slot i, so direct writes to other slots stay stale.
19. removeThinInstance moves the last instance's matrix into the removed slot (the last index changes) and does not move per-instance colors, so colors no longer match after it.
20. removeFromScene of a light, or of its generator, sets light.shadowGenerator to undefined; re-adding the light brings no shadow back. The generator's task resources are disposed only at the next rebuildSceneRenderables or disposeScene.
21. Only the first MAX_LIGHTS (16) entries of scene.lights are uploaded or chosen for a mesh; later lights are dropped without error. setMaxLights(n) raises the cap.
22. HemisphericLight colors are diffuseColor, specularColor, groundColor (default [0,0,0]; direction [0,1,0]); writes to them wait for a lights UBO refill: _bumpLightVersion, setLightIntensity or direction.set on any light, or a light added.
23. Lights use their worldMatrix: a parent's move changes a light's uploaded position at once, and a parent's rotation turns its direction, renormalized under scale.
24. setMeshVisible(node, v) writes v to every descendant in node.children, so showing a parent also shows children that were hidden on their own.
25. rotation is a live Euler XYZ view of rotationQuaternion, which always exists: a rotation.y write changes rotationQuaternion and the matrix, and setting rotationQuaternion changes what rotation reads.
26. worldMatrix is up to date on the next read after any position, rotation, scaling or parent write, also for children of a moved parent, whose worldMatrixVersion is bumped at once; no frame is needed.
27. setShadowGeneratorEnabled(sg, false) makes the generator skip its map render and uploads darkness 1 (no shadow); enabling again renders and restores the configured darkness, default 0 (full shadow).
28. createPcfSpotlightShadowGenerator defaults to mapSize 512, near 1 and far = light.range read at creation (10000 if unbounded). The directional PCF, ESM and CSM generators default to mapSize 1024.
29. cloneTransformNode names each copy name + "_clone", deep-clones children parented to the copy, shares the mesh's GPU geometry, and adds nothing to any scene. It throws a TypeError if the subtree holds a camera.
30. setThinInstanceCount checks nothing: it ignores a mesh with no thin instances, accepts a count above capacity. setThinInstanceDrawCount throws RangeError above capacity and, for a changed count, an Error until all writes are GPU-synced.
31. disposeScene empties scene.meshes and scene.lights, sets scene.camera to null and disposes at once every mesh it held last, so those cannot be added to another scene; meshes held by another scene survive.
32. addToScene accepts a mesh whose material is null: it is listed in scene.meshes but joins no group; assigning mesh.material afterwards queues it for a build.
33. setThinInstanceColor throws until setThinInstanceColors has given a colors array; enableThinInstanceGpuCulling throws on a mesh with no thin instances.
34. setParent under a parent with a zero scale copies the child's old world position into its local position and does not compensate rotation or scale, so the child moves.
35. createCsmDirectionalShadowGenerator caps numCascades at 4 without error; the default is 4.
