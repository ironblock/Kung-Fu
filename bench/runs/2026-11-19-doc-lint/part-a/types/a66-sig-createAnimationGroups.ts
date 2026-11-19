// a-66, line 233: "export function createAnimationGroups(animData: GltfAnimationData): AnimationGroup[];"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
import { createAnimationGroups } from "@babylonjs/lite";
import type { AnimationGroup, GltfAnimationData } from "@babylonjs/lite";

export const asDocumented: (animData: GltfAnimationData) => AnimationGroup[] = createAnimationGroups;
