# S6: which index order is a front face

**The behaviour.** Babylon Lite's front faces are the triangles whose (v1-v0)x(v2-v0) points into the solid (counter-clockwise seen from outside, by the right-hand rule, is the BACK face): its own box is wound that way and the Standard pipeline culls with `frontFace: "ccw"` in its default left-handed scenes (and flips both together in right-handed ones).

**What the reader would write, and why.** Each face counter-clockwise seen from outside, `indices.push(v, v + 1, v + 2, v, v + 2, v + 3)`, the "outward by the right-hand rule" convention of WebGPU's and OpenGL's default `frontFace: "ccw"`, glTF and most modelling tools. Babylon.js itself is left-handed and winds the other way, but a reader building raw vertex data usually reaches for the GPU default; and `createMeshFromData(engine, name, positions, normals, indices, ...)` in `names/mesh/mesh-factories.d.ts` says nothing about winding. The real model (1.35.0) did exactly this and lost 70 turns to inside-out boxes it took for shimmer and shadow acne.

**What decides it**, in `babylon-lite/packages/babylon-lite/src/`:
- `mesh/create-box.ts` lines 61-68 (`BOX_INDICES`, `0, 1, 2, 0, 2, 3` per face, against that file's vertex order, which makes (v1-v0)x(v2-v0) point inwards on every face).
- `material/standard/standard-pipeline.ts` lines 314-316: `cullMode: "back"`, `frontFace: _rightHanded ? (...) : "ccw"`.
- `shadow/shadow-base.ts` lines 62-68: the light view mirrors with the camera in right-handed scenes so the same winding keeps working.

**Makers' unit test:** none that pins the winding of `createBox` or of `createMeshFromData` (`tests/lite/unit/create-box.test.ts` checks only dimensions).

**comment: no.** No comment on `createMeshFromData`, `createBox` or the pipeline says which order is front. (Comments are removed from `names/`.)
