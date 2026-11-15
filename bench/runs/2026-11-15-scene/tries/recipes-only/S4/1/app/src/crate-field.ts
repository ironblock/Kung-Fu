import {
  addToScene,
  createBox,
  createTranslationMat4,
  setThinInstances,
} from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

// One 1-unit cube, drawn once per centre as a thin instance (unrotated, in the
// order given). Shadow-map coverage depends on the mesh's bounds including every
// instance; that is NOT set here yet. See the notes in the reply.
export function createCrateField(
  engine: EngineContext,
  scene: SceneContext,
  centres: [number, number, number][],
): Mesh {
  const crate = createBox(engine, 1);

  const matrices = new Float32Array(centres.length * 16);
  centres.forEach(([x, y, z], i) => {
    matrices.set(createTranslationMat4(x, y, z), i * 16);
  });
  setThinInstances(crate, matrices, centres.length);

  addToScene(scene, crate);
  return crate;
}
