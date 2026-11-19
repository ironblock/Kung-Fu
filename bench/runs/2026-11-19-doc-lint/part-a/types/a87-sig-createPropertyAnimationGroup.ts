// a-87, line 258: "export function createPropertyAnimationGroup("
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
// The signature spans lines 258-270; it is copied here whole.
import { createPropertyAnimationGroup } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager, PropertyAnimationClip } from "@babylonjs/lite";

export const asDocumented: (
    manager: AnimationManager,
    target: object,
    clip: PropertyAnimationClip,
    options?: {
        readonly loop?: boolean;
        readonly speedRatio?: number;
        readonly fromFrame?: number;
        readonly toFrame?: number;
        readonly fromTime?: number;
        readonly toTime?: number;
    }
) => AnimationGroup = createPropertyAnimationGroup;
