import { describe, expect, it } from "vitest";
import { createAnimationManager, getAnimationGroups, updateAnimationManager } from "@babylonjs/lite";
import { loopKeyedTrack } from "../src/timeline-loop";

type Key = { frame: number; value: number };

/** The value the track should show `seconds` after it started: from the first key, looping over the keyed span. */
function expected(keys: Key[], frameRate: number, seconds: number): number {
    const first = keys[0]!.frame;
    const span = (keys[keys.length - 1]!.frame - first) / frameRate;
    const frame = first + (seconds % span) * frameRate;
    for (let i = 0; i < keys.length - 1; i++) {
        const a = keys[i]!;
        const b = keys[i + 1]!;
        if (frame >= a.frame && frame <= b.frame) {
            return a.value + ((frame - a.frame) / (b.frame - a.frame)) * (b.value - a.value);
        }
    }
    return keys[keys.length - 1]!.value;
}

describe("AP6 loop a timeline track", () => {
    it("starts moving from the first key at once and loops straight back to it", () => {
        const manager = createAnimationManager();
        const box = { position: { x: 0 } };
        const keys = [
            { frame: 30, value: 0 },
            { frame: 60, value: 10 },
            { frame: 90, value: 0 },
        ];
        const group = loopKeyedTrack(manager, box, "position.x", keys, 30);
        expect(getAnimationGroups(manager)).toContain(group);

        let seconds = 0;
        for (let i = 0; i < 45; i++) {
            updateAnimationManager(manager, 110);
            seconds += 0.11;
            expect(box.position.x).toBeCloseTo(expected(keys, 30, seconds), 3);
        }
    });

    it("follows each track's own keys and frame rate, several at once", () => {
        const manager = createAnimationManager();
        const sign = { tilt: 0, glow: { level: 0 } };
        const tiltKeys = [
            { frame: 12, value: -1 },
            { frame: 36, value: -5 },
            { frame: 48, value: -2 },
            { frame: 60, value: -1 },
        ];
        const glowKeys = [
            { frame: 100, value: 0.2 },
            { frame: 130, value: 0.9 },
        ];
        loopKeyedTrack(manager, sign, "tilt", tiltKeys, 24);
        loopKeyedTrack(manager, sign, "glow.level", glowKeys, 60);

        let seconds = 0;
        for (let i = 0; i < 40; i++) {
            updateAnimationManager(manager, 70);
            seconds += 0.07;
            expect(sign.tilt).toBeCloseTo(expected(tiltKeys, 24, seconds), 3);
            expect(sign.glow.level).toBeCloseTo(expected(glowKeys, 60, seconds), 3);
        }
    });
});
