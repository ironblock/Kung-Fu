import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame, updateAnimationManager } from "@babylonjs/lite";

it("a frame key uses its track's frameRate, else the clip's: options.frameRate, else the first track's, else 60; ranges and goToFrame use the clip's", () => {
    const keys = [{ frame: 0, value: 0 }, { frame: 30, value: 30 }];
    const fromFirstTrack = createPropertyAnimationClip("c", [
        { path: "a", frameRate: 30, keys },
        { path: "b", keys },
    ]);
    expect(fromFirstTrack.frameRate).toBe(30);
    expect(fromFirstTrack.tracks[1]!.sampler.input[1]).toBe(1);

    const fromOptions = createPropertyAnimationClip("c", [
        { path: "a", keys },
        { path: "b", frameRate: 30, keys },
    ], { frameRate: 10 });
    expect(fromOptions.frameRate).toBe(10);
    expect(fromOptions.tracks[0]!.sampler.input[1]).toBe(3);
    expect(fromOptions.tracks[1]!.sampler.input[1]).toBe(1);

    const plain = createPropertyAnimationClip("c", [{ path: "a", keys }]);
    expect(plain.frameRate).toBe(60);
    expect(plain.duration).toBe(0.5);

    const manager = createAnimationManager();
    const group = createPropertyAnimationGroup(manager, { a: 0, b: 0 }, fromOptions, { fromFrame: 5, toFrame: 20, loop: false });
    expect(group.frameRate).toBe(10);
    expect(group.currentTime).toBe(0.5);
    updateAnimationManager(manager, 5000);
    expect(group.currentTime).toBe(2);
    goToFrame(group, 10);
    expect(group.currentTime).toBe(1);
});
