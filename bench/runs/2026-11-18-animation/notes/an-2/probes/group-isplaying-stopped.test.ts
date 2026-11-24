import { addAnimationGroup, createAnimationGroups, createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, playAnimation, stopAnimation, updateAnimationManager } from "@babylonjs/lite";
import { gltfData, recorder } from "./gltf-fixture.ts";

const ramp = () => createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);

test("isPlaying = true does not resume a group stopped by stopAnimation; playAnimation does", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const g = createPropertyAnimationGroup(manager, target, ramp());
    stopAnimation(g);
    g.isPlaying = true;
    updateAnimationManager(manager, 500);
    expect(g.currentTime).toBe(0);
    expect(target.v).toBe(-1);
    playAnimation(g);
    updateAnimationManager(manager, 500);
    expect(target.v).toBe(5);
});

test("isPlaying = true does not resume a non-looping group that reached its end", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const g = createPropertyAnimationGroup(manager, target, ramp(), { loop: false });
    updateAnimationManager(manager, 2000);
    g.currentTime = 0;
    g.isPlaying = true;
    updateAnimationManager(manager, 500);
    expect(g.currentTime).toBe(0);
    expect(target.v).toBe(10);
});

test("isPlaying = true does not start a glTF group other than the first; playAnimation does", () => {
    const targets = [recorder(), recorder()];
    const [, scale] = createAnimationGroups(gltfData(targets));
    const manager = createAnimationManager();
    addAnimationGroup(manager, scale!);
    scale!.isPlaying = true;
    updateAnimationManager(manager, 1000);
    expect(scale!.currentTime).toBe(0);
    expect(targets[1]!.writes).toBe(0);
    playAnimation(scale!);
    updateAnimationManager(manager, 1000);
    expect(targets[1]!.s).toEqual([2, 2, 2]);
});
