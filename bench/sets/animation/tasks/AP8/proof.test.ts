import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame, playAnimation, updateAnimationManager } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager, CreatePropertyAnimationGroupOptions } from "@babylonjs/lite";

const expected = JSON.parse(readFileSync(new URL("./AP8.expected.json", import.meta.url), "utf8")) as {
    freshAngleAfterHalfSecond: number;
    seekedAngleAfterHalfSecond: number;
    seekedIsPlayingAfterThreeSeconds: boolean;
    loopingAngleAfterQuarterSecond: number;
};

function door(options: CreatePropertyAnimationGroupOptions): { manager: AnimationManager; target: { angle: number }; group: AnimationGroup } {
    const manager = createAnimationManager();
    const target = { angle: 90 };
    const clip = createPropertyAnimationClip("door-open", [
        {
            path: "angle",
            keys: [
                { time: 0, value: 0 },
                { time: 1, value: 90 },
            ],
        },
    ]);
    const group = createPropertyAnimationGroup(manager, target, clip, options);
    return { manager, target, group };
}

function update(manager: AnimationManager, seconds: number): void {
    for (let i = 0; i < Math.round(seconds * 20); i++) {
        updateAnimationManager(manager, 50);
    }
}

describe("AP8 backward one-shot", () => {
    it("freshAngleAfterHalfSecond", () => {
        const { manager, target } = door({ loop: false, speedRatio: -1 });
        update(manager, 0.5);
        expect(target.angle).toBeCloseTo(expected.freshAngleAfterHalfSecond, 3);
    });

    it("seekedAngleAfterHalfSecond and seekedIsPlayingAfterThreeSeconds", () => {
        const { manager, target, group } = door({ loop: false, speedRatio: -1 });
        goToFrame(group, 60);
        playAnimation(group);
        update(manager, 0.5);
        expect(target.angle).toBeCloseTo(expected.seekedAngleAfterHalfSecond, 3);
        update(manager, 2.5);
        expect(target.angle).toBeCloseTo(0, 5);
        expect(group.isPlaying).toBe(expected.seekedIsPlayingAfterThreeSeconds);
    });

    it("loopingAngleAfterQuarterSecond", () => {
        const { manager, target } = door({ loop: true, speedRatio: -1 });
        update(manager, 0.25);
        expect(target.angle).toBeCloseTo(expected.loopingAngleAfterQuarterSecond, 3);
    });
});
