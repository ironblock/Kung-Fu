# S4: what a single-map shadow fits to on a thin-instanced mesh

**The behaviour.** A single-map directional shadow (PCF or ESM) fits its map to each caster's own `boundMin`/`boundMax` through the mesh's world matrix only; thin-instance matrices are not looked at, so a thin-instanced mesh counts as one prototype box at the mesh's position, and `enableThinInstanceWorldBounds` does not change that in 1.39.0.

**What the reader would write, and why.** `setThinInstances(box, matrices, n)` and `addToScene`, perhaps followed by `enableThinInstanceWorldBounds(box)`. In Babylon.js thin instances update the mesh's bounding info (`thinInstanceRefreshBoundingInfo`, done by default on `thinInstanceSetBuffer`), and a shadow generator with `autoUpdateExtends` covers what the casters' bounding infos say. A reader who finds `enableThinInstanceWorldBounds(mesh)` in `names/mesh/` takes it for that refresh, as the real model did on 1.35.0, where it fixed missing shadows. In 1.39.0 that function only installs a hook read by camera framing and scene sizing, so both the plain answer and that fix fail here. Nothing in `names/` says that `boundMin`/`boundMax` are local and may be widened to the union of the placements.

**What decides it**, in `babylon-lite/packages/babylon-lite/src/`:
- `shadow/shadow-base.ts` lines 107-123: `computeDirectionalLightMatrix` takes eight corners of `mesh.boundMin`/`boundMax` (default a unit box) through `mesh.worldMatrix`, with no instance matrix. Used by `shadow/pcf-directional-shadow-generator.ts` line 98 and `shadow/esm-directional-shadow-generator.ts` line 324.
- `mesh/enable-thin-instance-world-bounds.ts` lines 58-63: it sets only `mesh._expandWorldBounds`, which is read only by `mesh/mesh-world-bounds.ts` line 49 (`expandWorldAabbForMesh`, used by `scene/scene-camera.ts` and `material/pbr/scene-size.ts`).
- `mesh/mesh.ts` lines 116-145: the comment on `boundMin`/`boundMax` says they are local and that a consumer may overwrite them with a wider box, e.g. the union of a thin-instance prototype's placements.
- By contrast the cascaded path does read instances: `shadow/csm-shadow-task-hooks.ts` lines 852-866.

**Makers' unit test:** none for the single-map fit with thin instances. `tests/lite/unit/mesh-world-bounds.test.ts`, "composes thin-instance matrices before the prototype world matrix", pins `expandWorldAabbForMesh`, not the shadow fit.

**comment: no** on the behaviour. The doc comment on `enableThinInstanceWorldBounds` reads "Enable exact `worldMatrix × instanceMatrix × localBounds` setup-time bounds for a thin-instance mesh.", which suggests it covers the shadow fit too. (Comments are removed from `names/`.)
