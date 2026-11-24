import { describe, expect, it } from "vitest";
import * as mod from "../src/rota";
import { unchanged } from "./helpers-rota";

// Midnight of day 14, a Monday. Every shift below starts more than 48 hours later.
const T0 = 14 * 1440;

function yard() {
    const rota = new mod.Rota();
    rota.addStaff({ id: "ada", name: "Ada", roles: ["hand", "lock"], ratePence: 1260, contractMinutes: 2400 });
    rota.addStaff({ id: "bram", name: "Bram", roles: ["hand", "fitter"], ratePence: 1575, contractMinutes: 2250 });
    rota.addStaff({ id: "cleo", name: "Cleo", roles: ["office"], ratePence: 1333, contractMinutes: 1200 });
    rota.addStaff({ id: "dov", name: "Dov", roles: ["hand", "office", "lock"], ratePence: 1100, contractMinutes: 900 });
    rota.addStaff({ id: "eli", name: "Eli", roles: ["hand"], ratePence: 1150, contractMinutes: 900 });
    rota.addShift(18, 420, 900, "hand", "ada"); // s1
    rota.addShift(19, 420, 900, "hand", "ada"); // s2
    return rota;
}

// Every request the person asked or was asked, as [id, status, decidedAt], newest first.
function seen(rota: InstanceType<typeof mod.Rota>, staffId: string): [string, string, number][] {
    return rota.swapsFor(staffId).map((w) => [w.id, w.status, w.decidedAt]);
}

function messageOf(run: () => unknown): string {
    try {
        run();
    } catch (err) {
        return err instanceof Error ? err.message : `threw ${String(err)}`;
    }
    return "did not throw";
}

describe("Rota.decideSwap, approving", () => {
    it("refuses the other pending requests for the shift, with the same decidedAt", () => {
        const rota = yard();
        rota.requestSwap("s1", "bram", T0); // w1
        rota.requestSwap("s1", "dov", T0 + 1); // w2
        rota.requestSwap("s1", "eli", T0 + 2); // w3
        const decided = rota.decideSwap("w2", true, T0 + 90);
        expect([decided.id, decided.status, decided.decidedAt]).toEqual(["w2", "approved", T0 + 90]);
        expect(rota.shift("s1")?.staffId).toBe("dov");
        expect(seen(rota, "ada")).toEqual([
            ["w3", "refused", T0 + 90],
            ["w2", "approved", T0 + 90],
            ["w1", "refused", T0 + 90],
        ]);
        expect(rota.pendingSwaps()).toEqual([]);
    });

    it("refuses them whichever request is approved, the first asked or the last", () => {
        const first = yard();
        first.requestSwap("s1", "bram", T0);
        first.requestSwap("s1", "dov", T0 + 1);
        first.decideSwap("w1", true, T0 + 30);
        expect(seen(first, "ada")).toEqual([
            ["w2", "refused", T0 + 30],
            ["w1", "approved", T0 + 30],
        ]);
        const last = yard();
        last.requestSwap("s1", "bram", T0);
        last.requestSwap("s1", "dov", T0 + 1);
        last.decideSwap("w2", true, T0 + 40);
        expect(seen(last, "ada")).toEqual([
            ["w2", "approved", T0 + 40],
            ["w1", "refused", T0 + 40],
        ]);
    });

    it("does not touch the requests for other shifts", () => {
        const rota = yard();
        rota.requestSwap("s1", "bram", T0); // w1
        rota.requestSwap("s2", "bram", T0 + 1); // w2
        rota.requestSwap("s1", "dov", T0 + 2); // w3
        rota.requestSwap("s2", "dov", T0 + 3); // w4
        rota.decideSwap("w3", true, T0 + 90);
        expect(seen(rota, "ada")).toEqual([
            ["w4", "pending", -1],
            ["w3", "approved", T0 + 90],
            ["w2", "pending", -1],
            ["w1", "refused", T0 + 90],
        ]);
        expect(rota.pendingSwaps().map((w) => w.id).sort()).toEqual(["w2", "w4"]);
        expect(rota.shift("s2")?.staffId).toBe("ada");
    });

    it("leaves the requests that were decided before as they were", () => {
        const rota = yard();
        rota.requestSwap("s1", "eli", T0); // w1
        rota.decideSwap("w1", false, T0 + 10);
        rota.requestSwap("s1", "bram", T0 + 20); // w2
        rota.decideSwap("w2", true, T0 + 30);
        // The shift is Bram's now, and Bram asks two people.
        rota.requestSwap("s1", "dov", T0 + 40); // w3
        rota.requestSwap("s1", "ada", T0 + 50); // w4
        rota.decideSwap("w4", true, T0 + 60);
        expect(rota.shift("s1")?.staffId).toBe("ada");
        expect(seen(rota, "eli")).toEqual([["w1", "refused", T0 + 10]]);
        expect(seen(rota, "bram")).toEqual([
            ["w4", "approved", T0 + 60],
            ["w3", "refused", T0 + 60],
            ["w2", "approved", T0 + 30],
        ]);
    });

    it("refuses a pending request that an earlier holder of the shift asked", () => {
        const rota = yard();
        rota.requestSwap("s1", "bram", T0); // w1, asked by Ada
        rota.assign("s1", "dov");
        rota.requestSwap("s1", "eli", T0 + 1); // w2, asked by Dov
        rota.decideSwap("w2", true, T0 + 9);
        expect(rota.shift("s1")?.staffId).toBe("eli");
        expect(seen(rota, "bram")).toEqual([["w1", "refused", T0 + 9]]);
        expect(seen(rota, "eli")).toEqual([["w2", "approved", T0 + 9]]);
        expect(rota.pendingSwaps()).toEqual([]);
    });
});

describe("Rota.decideSwap, refusing", () => {
    it("still changes no other request", () => {
        const rota = yard();
        rota.requestSwap("s1", "bram", T0); // w1
        rota.requestSwap("s1", "dov", T0 + 1); // w2
        rota.requestSwap("s1", "eli", T0 + 2); // w3
        const decided = rota.decideSwap("w2", false, T0 + 90);
        expect([decided.id, decided.status, decided.decidedAt]).toEqual(["w2", "refused", T0 + 90]);
        expect(seen(rota, "ada")).toEqual([
            ["w3", "pending", -1],
            ["w2", "refused", T0 + 90],
            ["w1", "pending", -1],
        ]);
        expect(rota.shift("s1")?.staffId).toBe("ada");
    });
});

describe("Rota.decideSwap, when approving throws", () => {
    it("changes no request when the person cannot hold the shift", () => {
        const rota = yard();
        rota.requestSwap("s1", "bram", T0); // w1
        rota.requestSwap("s1", "cleo", T0 + 1); // w2, and Cleo does not work as a hand
        rota.requestSwap("s1", "dov", T0 + 2); // w3
        expect(messageOf(() => rota.decideSwap("w2", true, T0 + 90))).toBe("Cleo does not work as hand");
        expect(seen(rota, "ada")).toEqual([
            ["w3", "pending", -1],
            ["w2", "pending", -1],
            ["w1", "pending", -1],
        ]);
        expect(rota.shift("s1")?.staffId).toBe("ada");
    });

    it("changes no request when the shift has left the person who asked", () => {
        const rota = yard();
        rota.requestSwap("s1", "bram", T0); // w1
        rota.requestSwap("s1", "dov", T0 + 1); // w2
        rota.assign("s1", "eli");
        expect(messageOf(() => rota.decideSwap("w1", true, T0 + 90))).toBe("ada no longer holds s1");
        expect(seen(rota, "ada")).toEqual([
            ["w2", "pending", -1],
            ["w1", "pending", -1],
        ]);
        expect(rota.shift("s1")?.staffId).toBe("eli");
    });
});

unchanged(mod, ["Rota.decideSwap approving one request leaves the others for the shift pending"]);
