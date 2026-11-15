# MEND

- r03 (without): said "addToScene of the same mesh then throws ... it has to be created again" after removeFromScene; now says it throws once the next frame is submitted, and that added back sooner it does not throw but its buffers are destroyed all the same and it stays in the draw list with them, so create it again. The checker was right that addToScene does not throw early (also in a never-registered scene), but wrong that the buffers are kept: the probe shows them destroyed after the next frame while the mesh still draws from them.
- r05 (without 1): said plain writes "are not uploaded until the light moves"; now says until a light in the scene (this one or another) moves or gets a setLight* call, which rewrites the whole lights buffer. Probe adds both cases, and that a mesh move does not do it.
- r06 (steps comment and without 1): said "keeps m itself" and "an in-place edit of m is never uploaded"; now says "keeps m, until an add", that the edit is not uploaded until the next addThinInstance or removeThinInstance, and that after addThinInstance (which copies into a new array) edits go to box.thinInstances.matrices, as edits of m are lost. Probe adds the add (copy and upload) and remove (keeps m, uploads) cases.
- r08 (without 3): said "An in-place edit (scene.fog.end = 50) is not uploaded"; now says it is not uploaded while the camera stays still and is uploaded at the next camera move. Probe adds the camera-move case.
- r09 (without): said "Set after registration and the mesh not moved, the exclusion is not applied"; now says it is not applied until the mesh moves or a light is added to or removed from the scene. Probe adds the add-light and remove-light cases.

Dropped: none. Unchanged (holds): r01, r02, r04, r07, r10, r11, r12.
