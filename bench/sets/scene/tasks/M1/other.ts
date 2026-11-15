import { onBeforeRender } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

// Another right answer: a per-scene registry object with an index loop.
const registry = new Map<SceneContext, { fns: ((d: number) => void)[] }>();

export function addSystem(scene: SceneContext, update: (deltaMs: number) => void): void {
    let entry = registry.get(scene);
    if (entry === undefined) {
        const created = { fns: [] as ((d: number) => void)[] };
        entry = created;
        registry.set(scene, created);
        onBeforeRender(scene, (d) => {
            const n = created.fns.length;
            for (let i = 0; i < n; i++) {
                created.fns[i]!(d);
            }
        });
    }
    entry.fns.push(update);
}
