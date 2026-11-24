// c-48. Line 619: "**goToFrame(f)**: Sets `group.currentTime = f / group.frameRate`, evaluates the pose immediately for
// manual property clips (or engine-backed clips when an engine is provided), then pauses."
// Checked: (1) a property group at frame rate 10, playing: goToFrame(g, 5) gives currentTime 0.5, writes the value at
// 0.5 s at once, and leaves the group paused. (2) a stopped glTF group with a skeleton: goToFrame(g, 30, engine) at the
// default 60 fps gives 0.5 s, writes the node and uploads the bones at once, and leaves it paused.
import { createAnimationGroups, createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame } from "@babylonjs/lite";
import { gltf, moveClip, nodeRecorder, recordingEngine, rest, skeleton } from "./_fx";

test("property clip", () => {
    const target = { v: -1 };
    const g = createPropertyAnimationGroup(createAnimationManager(), target, createPropertyAnimationClip("c", [{ path: "v", frameRate: 10, keys: [{ frame: 0, value: 0 }, { frame: 10, value: 10 }] }]));
    goToFrame(g, 5);
    expect(g.currentTime).toBe(0.5);
    expect(target.v).toBe(5);
    expect(g.isPlaying).toBe(false);
});

test("engine-backed glTF clip", () => {
    const rec = recordingEngine();
    const node = nodeRecorder();
    const [, g] = createAnimationGroups(gltf([moveClip("a", 0, 1), moveClip("b", 0, 10)], [rest()], { targets: [node], skeletons: [skeleton(0)] }));
    goToFrame(g!, 30, rec.engine);
    expect(g!.currentTime).toBe(0.5);
    expect(node.p[0]).toBeCloseTo(5, 5);
    expect(rec.calls.filter((c) => c.method === "writeTexture").length).toBe(1);
    expect(g!.isPlaying).toBe(false);
});
