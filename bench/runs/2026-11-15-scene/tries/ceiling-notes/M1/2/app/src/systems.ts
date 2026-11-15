import { onBeforeRender, type SceneContext } from "@babylonjs/lite";

type System = (deltaMs: number) => void;

// The systems of each scene, in the order they were added.
const systemsByScene = new WeakMap<SceneContext, System[]>();

/**
 * Adds an update system to `scene`. Every frame, before the scene renders,
 * the scene's systems are called once each, in the order they were added
 * (first added runs first). This also holds for systems added while the game
 * is already running.
 */
export function addSystem(scene: SceneContext, update: System): void {
    let systems = systemsByScene.get(scene);
    if (!systems) {
        const list: System[] = [];
        systems = list;
        systemsByScene.set(scene, list);
        // onBeforeRender puts each new callback at the front, so callbacks run
        // last-registered-first. If each system were registered on its own they
        // would run in reverse order. So we register a single callback per scene
        // and run the systems from our own list, in the order they were added.
        onBeforeRender(scene, (deltaMs) => {
            // Read the length once: a system added during a frame (for example
            // by another system) starts on the next frame. That way it runs a
            // whole frame, not just part of one.
            const count = list.length;
            for (let i = 0; i < count; i++) {
                list[i](deltaMs);
            }
        });
    }
    systems.push(update);
}
