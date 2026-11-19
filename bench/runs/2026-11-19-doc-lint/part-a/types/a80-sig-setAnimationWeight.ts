// a-80, line 249: "export function setAnimationWeight(group: AnimationGroup, weight: number): void;"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
import { setAnimationWeight } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

export const asDocumented: (group: AnimationGroup, weight: number) => void = setAnimationWeight;
