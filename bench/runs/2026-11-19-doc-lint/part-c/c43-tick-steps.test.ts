// c-43. Lines 609-613 (diagram): "tickAnimation(group, deltaMs, engine)" -> "advance time, wrap/clamp, evaluate
// channels, upload bone matrices + morph weights".
// Checked through the manager (tickAnimation itself is not exported): one update of a looping glTF group past its end
// wraps the time (1.25 s -> 0.25 s), writes the pose at the wrapped time, and uploads bones and morph weights; a
// non-looping group is clamped at its end.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import type { ClipSpec } from "./_fx";
import { gltf, morphBinding, nodeRecorder, recordingEngine, rest, skeleton } from "./_fx";

const clip = (): ClipSpec => ({
    name: "c",
    duration: 1,
    channels: [
        { samplerIdx: 0, nodeIdx: 0, path: 0 },
        { samplerIdx: 1, nodeIdx: 1, path: 3 },
    ],
    samplers: [
        { input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, 10, 0, 0]), interpolation: 0 },
        { input: new Float32Array([0, 1]), output: new Float32Array([0, 1]), interpolation: 0 },
    ],
});

test("advance, wrap or clamp, evaluate, upload", () => {
    const rec = recordingEngine();
    const node = nodeRecorder();
    const [group] = createAnimationGroups(gltf([clip()], [rest(), rest()], { targets: [node, undefined], skeletons: [skeleton(0)], morphBindings: [morphBinding(1, 1)] }));
    const manager = createAnimationManager({ engine: rec.engine });
    addAnimationGroup(manager, group!);
    updateAnimationManager(manager, 1250);
    expect(group!.currentTime).toBeCloseTo(0.25, 6);
    expect(node.p[0]).toBeCloseTo(2.5, 5);
    expect(rec.calls.map((c) => c.method).sort()).toEqual(["writeBuffer", "writeTexture"]);

    const node2 = nodeRecorder();
    const [once] = createAnimationGroups(gltf([clip()], [rest(), rest()], { targets: [node2, undefined], skeletons: [skeleton(0)], morphBindings: [morphBinding(1, 1)] }));
    once!.loopAnimation = false;
    const m2 = createAnimationManager({ engine: rec.engine });
    addAnimationGroup(m2, once!);
    updateAnimationManager(m2, 1250);
    expect(once!.currentTime).toBe(1);
    expect(node2.p[0]).toBe(10);
});
