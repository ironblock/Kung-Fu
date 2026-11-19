// a-67, line 234: "export function goToFrame(group: AnimationGroup, frame: number, engine?: EngineContext): void;"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
import { goToFrame } from "@babylonjs/lite";
import type { AnimationGroup, EngineContext } from "@babylonjs/lite";

export const asDocumented: (group: AnimationGroup, frame: number, engine?: EngineContext) => void = goToFrame;
