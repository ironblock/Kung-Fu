# Mended notes

Each of the 14 notes the checker marked "wider" was tested on the checker's case; the case held every time, so each was rewritten and its probe extended. None was dropped; no note marked "holds" was touched.

- n01: was: removeFromScene disposes a mesh that leaves its last scene: once GPU retirements drain (await waitForGpuResourceRetirements(engine)) its buffers are destroyed and addToScene(mesh) throws. To hide a mesh, use setMeshVisible(mesh, false).
  now: removeFromScene disposes a mesh that leaves its last scene: after await waitForGpuResourceRetirements(engine), addToScene(mesh) throws and its buffers are destroyed unless a cloneTransformNode clone shares them. Hide with setMeshVisible.
- n12: was: Directional ESM/PCF shadows keep only casters between orthoMinZ and orthoMaxZ (defaults 1 and 10000) along direction from light.position, which defaults to (0,0,0), not -direction as in Babylon.js. Put position behind the casters.
  now: Directional ESM/PCF shadows keep only casters orthoMinZ..orthoMaxZ (defaults 1, 10000) along direction from the light's world position (light.position, default (0,0,0), moved by parents), not -direction. Put it behind the casters.
- n14: was: Turn fog on with setFog(scene, config). Assigning scene.fog directly never registers the fog uniform writer, so its values never reach the shaders; after setFog, later edits to scene.fog are uploaded.
  now: Turn fog on with setFog(scene, config); a plain scene.fog assignment never reaches the shaders. After setFog, a new object assigned to scene.fog is uploaded, but an in-place edit (scene.fog.start = 7) is not uploaded by itself.
- n20: was: After upload, plain writes to a light's intensity, diffuse, specular, range, exponent, diffuseColor or groundColor are not sent until its version moves; use setLightIntensity/setLightDiffuseColor. position, direction, angle are tracked.
  now: After upload, plain writes to intensity, diffuse, specular, range, exponent, diffuseColor or groundColor wait for the light's next tracked change: setLightIntensity, setLightDiffuseColor (throws on hemispheric), position, direction, angle.
- n16: was: rotation is an Euler view of rotationQuaternion (never null) composed as qx*qy*qz, not Babylon.js's yaw-pitch-roll qy*qx*qz; results differ whenever rotation.x and rotation.y are both non-zero. Writing either updates the other.
  now: rotation is an Euler view of rotationQuaternion (never null) composed as qx*qy*qz, not Babylon.js's qy*qx*qz; they agree when rotation.x or rotation.y is 0 and differ e.g. at (0.7, 0.4, 0.2). Writing either updates the other.
- n13: was: Shadow receiving is fixed when the scene registers: a light.shadowGenerator or mesh.receiveShadows set after registerSceneWithShadowSupport does not reach Standard meshes until await rebuildSceneRenderables(scene).
  now: Shadow receiving is fixed when a Standard mesh is built: a light.shadowGenerator set after registerSceneWithShadowSupport reaches no mesh, and a receiveShadows change no built mesh, until await rebuildSceneRenderables(scene).
- n24: was: Mesh factories take the engine first, name the mesh after its shape ("box", "sphere", "ground", ...) and leave material null; a mesh added without a material sits in scene.meshes but gets no renderable.
  now: Shape factories (createBox, createSphere, createGround, ...) take the engine first, name the mesh after its shape and leave material null (the line factories set a line material); a mesh added without a material gets no renderable.
- n25: was: removeThinInstance(mesh, i) swap-removes: the last instance's matrix is copied into slot i, so the instance that was last now has index i.
  now: removeThinInstance(mesh, i) swap-removes: the last instance's matrix is copied into slot i, so the instance that was last now has index i. Colors are not moved: slot i keeps the removed instance's color.
- n23: was: A light is a scene node: its own rotation and its parents' rotations turn its direction, scaling does not, and point and spot positions come from the world matrix, so a parented light moves with its parent.
  now: A light is a scene node: its own and its parents' rotations turn its direction, uniform scaling does not but non-uniform scaling does, and point and spot positions come from the world matrix, so a parented light moves with its parent.
- n02: was: addToScene right after removeFromScene does not throw, but the queued disposal still runs: the mesh stays in scene.meshes with _disposed true and destroyed buffers. Create a new mesh instead of re-adding one.
  now: addToScene right after removeFromScene does not throw, but the queued disposal still runs: the mesh stays in scene.meshes with _disposed true and its buffers destroyed unless a cloneTransformNode clone shares them. Create a new mesh.
- n26: was: setThinInstances(mesh, matrices, count) keeps your array, not a copy. Writing into it later uploads nothing until flushThinInstances(mesh).
  now: setThinInstances(mesh, matrices, count) keeps your array, not a copy. Writing into it later uploads nothing until flushThinInstances(mesh) or setThinInstanceCount; setThinInstanceMatrix(mesh, i, m) uploads only slot i.
- n29: was: A mesh mirrored by negative scaling is not marked mirrored and keeps the default winding until await enableMirroredMeshes(scene) has run; after that, a mesh with a negative world determinant gets frontFace "cw".
  now: Negative scaling leaves a mesh's winding as is until enableMirroredMeshes has been awaited for any scene (its first call installs for all scenes); after that a procedural mesh with a negative world determinant gets frontFace "cw".
- n31: was: removeFromScene(light) disposes the light's shadow generator and sets light.shadowGenerator to undefined; removeFromScene(generator) unlinks it from its light, which stays in the scene.
  now: removeFromScene(light) sets light.shadowGenerator to undefined and drops the generator from scene.shadowGenerators, but destroys none of its textures; removeFromScene(generator) unlinks it from its light, which stays in the scene.
- n30: was: removeFromScene on a mesh that is in no scene at all still disposes it; on a mesh held only by other scenes it does nothing.
  now: removeFromScene on a mesh that is in no scene at all still disposes it. On a mesh held only by other scenes it does not dispose it, but sets its parent to null and also removes its children (disposing those in no scene).

Dropped: none.
