import { describe, expect, it } from "vitest";
import { createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import { createPulse } from "../src/pulse";

const UP_AND_DOWN_100 = [1.25, 1.5, 1.25, 1, 1];

function stepAndRead(manager: ReturnType<typeof createAnimationManager>, button: { scale: number }, deltaMs: number, count: number): number[] {
    const seen: number[] = [];
    for (let i = 0; i < count; i++) {
        updateAnimationManager(manager, deltaMs);
        seen.push(button.scale);
    }
    return seen;
}

function expectClose(seen: number[], expected: number[]): void {
    expect(seen.length).toBe(expected.length);
    for (let i = 0; i < expected.length; i++) {
        expect(seen[i]).toBeCloseTo(expected[i]!, 4);
    }
}

describe("AP2 pulse", () => {
    it("waits for a press, then pulses once and rests at 1", () => {
        const manager = createAnimationManager();
        const button = { scale: 1 };
        const press = createPulse(manager, button);

        expectClose(stepAndRead(manager, button, 100, 5), [1, 1, 1, 1, 1]);

        press();
        expectClose(stepAndRead(manager, button, 100, 5), UP_AND_DOWN_100);
        expectClose(stepAndRead(manager, button, 100, 6), [1, 1, 1, 1, 1, 1]);
    });

    it("pulses again, from the beginning, on every press after the last pulse finished", () => {
        const manager = createAnimationManager();
        const button = { scale: 1 };
        const press = createPulse(manager, button);

        press();
        expectClose(stepAndRead(manager, button, 100, 6), [...UP_AND_DOWN_100, 1]);

        press();
        expectClose(stepAndRead(manager, button, 100, 6), [...UP_AND_DOWN_100, 1]);

        expectClose(stepAndRead(manager, button, 250, 4), [1, 1, 1, 1]);

        press();
        expectClose(stepAndRead(manager, button, 50, 9), [1.125, 1.25, 1.375, 1.5, 1.375, 1.25, 1.125, 1, 1]);
    });

    it("keeps the pulses of two buttons apart", () => {
        const manager = createAnimationManager();
        const ok = { scale: 1 };
        const cancel = { scale: 1 };
        const pressOk = createPulse(manager, ok);
        const pressCancel = createPulse(manager, cancel);

        pressOk();
        updateAnimationManager(manager, 100);
        updateAnimationManager(manager, 100);
        expect(ok.scale).toBeCloseTo(1.5, 4);
        expect(cancel.scale).toBe(1);

        pressCancel();
        const okSeen: number[] = [];
        const cancelSeen: number[] = [];
        for (let i = 0; i < 5; i++) {
            updateAnimationManager(manager, 100);
            okSeen.push(ok.scale);
            cancelSeen.push(cancel.scale);
        }
        expectClose(okSeen, [1.25, 1, 1, 1, 1]);
        expectClose(cancelSeen, UP_AND_DOWN_100);

        pressOk();
        expectClose(stepAndRead(manager, ok, 100, 5), UP_AND_DOWN_100);
        expect(cancel.scale).toBeCloseTo(1, 5);
    });
});
