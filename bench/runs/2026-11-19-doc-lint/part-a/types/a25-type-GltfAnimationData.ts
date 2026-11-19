// a-25, lines 80-85: "export interface GltfAnimationData {" "readonly clips: readonly AnimationClip[];" "readonly nodes: readonly NodeRest[];" "readonly skeletons: readonly SkeletonBinding[];" "readonly morphBindings: readonly MorphBinding[];" "}"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
// Read in its favour: the interface has at least these four fields (the code has more).
import type { AnimationClip, GltfAnimationData } from "@babylonjs/lite";

declare const d: GltfAnimationData;
export const clips: readonly AnimationClip[] = d.clips;
export const parentIdx: number | undefined = d.nodes[0]?.parentIdx;
export const boneCount: number | undefined = d.skeletons[0]?.boneCount;
export const targetCount: number | undefined = d.morphBindings[0]?.targetCount;
