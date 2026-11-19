// c-46. Line 617: "**PLAYING**: `group.isPlaying = true`. Each `tickAnimation()` advances time, evaluates samplers,
// uploads GPU data."
// Checked through the manager: a playing glTF group with a skeleton, three updates of 100 ms: isPlaying true, time
// 0.1/0.2/0.3, the node is written each time with the sample at that time, and the bone texture is written each time.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import { gltf, moveClip, nodeRecorder, recordingEngine, rest, skeleton } from "./_fx";

test("each tick advances, evaluates, uploads", () => {
    const rec = recordingEngine();
    const node = nodeRecorder();
    const [g] = createAnimationGroups(gltf([moveClip("a", 0, 10)], [rest()], { targets: [node], skeletons: [skeleton(0)] }));
    const manager = createAnimationManager({ engine: rec.engine });
    addAnimationGroup(manager, g!);
    expect(g!.isPlaying).toBe(true);
    for (let i = 1; i <= 3; i++) {
        updateAnimationManager(manager, 100);
        expect(g!.currentTime).toBeCloseTo(0.1 * i, 6);
        expect(node.p[0]).toBeCloseTo(i, 5);
        expect(node.writes).toBe(i);
        expect(rec.calls.filter((c) => c.method === "writeTexture").length).toBe(i);
    }
});
