import { addAnimationTask, createAnimationTask } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

// Leaves the groups running and writes the value it found back after them, every update.
export function releaseProperty(manager: AnimationManager, target: object, path: string): void {
    const parts = path.split(".");
    const property = parts.pop()!;
    let owner: Record<string, unknown> = target as Record<string, unknown>;
    for (const part of parts) {
        owner = owner[part] as Record<string, unknown>;
    }
    const held = owner[property];
    addAnimationTask(
        manager,
        createAnimationTask(() => {
            owner[property] = held;
        })
    );
}
