import { onBeforeRender, type SceneContext } from "@babylonjs/lite";

type System = (deltaMs: number) => void;

// The systems of each scene, in the order they were added.
const systemsByScene = new WeakMap<SceneContext, System[]>();

/**
 * Adds an update system to `scene`. Every frame, before the scene renders, each
 * system of that scene is called once with the frame's delta in milliseconds,
 * in the order the systems were added (first added runs first). This also holds
 * for systems added while the game is already running.
 */
export function addSystem(scene: SceneContext, update: System): void {
    let systems = systemsByScene.get(scene);
    if (!systems) {
        const list: System[] = [];
        systems = list;
        systemsByScene.set(scene, list);
        // onBeforeRender puts each new callback before the earlier ones, so the
        // newest runs first. One callback per system would run them in reverse
        // order. Instead, register one dispatcher per scene and keep the order here.
        onBeforeRender(scene, (deltaMs) => {
            // Loop by index over the live array. A system added by another system
            // during this frame goes at the end and still runs this frame, after
            // all earlier ones.
            for (let i = 0; i < list.length; i++) {
                list[i](deltaMs);
            }
        });
    }
    systems.push(update);
}
