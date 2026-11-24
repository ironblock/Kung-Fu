import { describe, expect, it } from "vitest";
import * as mod from "../src/handover";
import { copyOf } from "./helpers";
import { unchanged } from "./helpers-handover";

type Hand = InstanceType<typeof mod.Handover>;

const kestrel = { name: "Kestrel", berths: 4, tankLitres: 180, gasBottles: 2 };
const bittern = { name: "Bittern", berths: 6, tankLitres: 220, gasBottles: 3 };
const at = (day: number, hour: number, minute = 0): number => day * 1440 + hour * 60 + minute;
const OUT_MUST = ["KEYS", "GAS", "SAFETY", "HELM", "INVENTORY"];
const BACK_MUST = ["KEYS", "INVENTORY", "PUMP", "MOORED"];

const fresh = (boat = kestrel): Hand => new mod.Handover("kf-12", boat, at(10, 14), at(17, 9, 30), 20000);
const checking = (boat = kestrel): Hand => {
    const h = fresh(boat);
    h.open(at(10, 13), "Mo");
    return h;
};
const out = (): Hand => {
    const h = checking();
    for (const code of OUT_MUST) h.tick("out", code, "ok", at(10, 13, 5), "Mo");
    h.read("out", { at: at(10, 13, 20), fuel: 1500, engine: 12034, water: 8, gas: 2 }, "Mo");
    h.release(at(10, 13, 40), "Mo");
    return h;
};
const returned = (): Hand => {
    const h = out();
    h.takeBack(at(17, 9), "Ines");
    return h;
};
// The method is new, so the cases reach it through a looser type.
const blockers = (h: Hand): string[] => {
    const loose = h as unknown as { blockers(): string[] };
    expect(typeof loose.blockers).toBe("function");
    return loose.blockers();
};

describe("Handover.blockers", () => {
    it("gives an empty list while the hire is only booked", () => {
        const h = fresh();
        expect(h.phase).toBe("booked");
        expect(blockers(h)).toEqual([]);
    });

    it("gives the out list's items that must be settled, in the list's order, while checking", () => {
        expect(blockers(checking())).toEqual(["KEYS", "GAS", "SAFETY", "HELM", "INVENTORY"]);
        expect(blockers(checking(bittern))).toEqual(["KEYS", "GAS", "SAFETY", "HELM", "CREW", "INVENTORY"]);
    });

    it("drops an item once it is ok or na, whatever order the items were ticked in", () => {
        const h = checking();
        h.tick("out", "INVENTORY", "ok", at(10, 13, 5), "Mo");
        expect(blockers(h)).toEqual(["KEYS", "GAS", "SAFETY", "HELM"]);
        h.tick("out", "HELM", "na", at(10, 13, 6), "Mo", "licensed skipper");
        h.tick("out", "KEYS", "ok", at(10, 13, 7), "Mo");
        expect(blockers(h)).toEqual(["GAS", "SAFETY"]);
        h.tick("out", "SAFETY", "ok", at(10, 13, 8), "Mo");
        h.tick("out", "GAS", "ok", at(10, 13, 9), "Mo");
        expect(blockers(h)).toEqual([]);
        expect(h.phase).toBe("checking");
    });

    it("keeps an item that is at fault, in its place in the list", () => {
        const h = checking();
        h.tick("out", "SAFETY", "fault", at(10, 13, 5), "Mo", "one lifejacket short");
        expect(blockers(h)).toEqual(["KEYS", "GAS", "SAFETY", "HELM", "INVENTORY"]);
        for (const code of ["KEYS", "GAS", "HELM", "INVENTORY"]) h.tick("out", code, "ok", at(10, 13, 6), "Mo");
        expect(blockers(h)).toEqual(["SAFETY"]);
        h.tick("out", "SAFETY", "todo", at(10, 13, 7), "Mo");
        expect(blockers(h)).toEqual(["SAFETY"]);
    });

    it("never gives an item whose must is false, todo or at fault", () => {
        const h = checking();
        for (const code of OUT_MUST) h.tick("out", code, "ok", at(10, 13, 5), "Mo");
        expect(h.checklist("out").items.filter((item) => item.state === "todo").map((item) => item.code)).toEqual([
            "WATER", "WEED",
        ]);
        expect(blockers(h)).toEqual([]);
        h.tick("out", "WATER", "fault", at(10, 13, 6), "Mo", "tap drips");
        expect(blockers(h)).toEqual([]);
    });

    it("gives an empty list while the boat is out, though the back list is all todo", () => {
        const h = out();
        expect(h.phase).toBe("out");
        expect(blockers(h)).toEqual([]);
    });

    it("gives the back list's items once the boat is back", () => {
        const h = returned();
        expect(h.phase).toBe("returned");
        expect(blockers(h)).toEqual(["KEYS", "INVENTORY", "PUMP", "MOORED"]);
        h.tick("back", "PUMP", "ok", at(17, 9, 5), "Ines");
        h.tick("back", "MOORED", "fault", at(17, 9, 6), "Ines", "left on the towpath side");
        h.tick("back", "CLEAN", "fault", at(17, 9, 7), "Ines", "galley greasy");
        h.tick("back", "KEYS", "na", at(17, 9, 8), "Ines");
        expect(blockers(h)).toEqual(["INVENTORY", "MOORED"]);
    });

    it("gives an empty list once the hire is closed", () => {
        const h = returned();
        for (const code of BACK_MUST) h.tick("back", code, "ok", at(17, 9, 5), "Ines");
        expect(blockers(h)).toEqual([]);
        h.read("back", { at: at(17, 9, 10), fuel: 1100, engine: 12290, water: 3, gas: 2 }, "Ines");
        expect(h.close(at(17, 9, 30), "Ines")).toBeDefined();
        expect(h.phase).toBe("closed");
        expect(blockers(h)).toEqual([]);
    });

    it("gives an empty list for a hire that was called off, whatever its lists hold", () => {
        const early = fresh();
        early.cancel(at(9, 10), "Mo", "party withdrew");
        expect(blockers(early)).toEqual([]);
        const late = checking();
        late.tick("out", "GAS", "fault", at(10, 13, 5), "Mo", "regulator hisses");
        late.cancel(at(10, 13, 30), "Mo", "gas fault");
        expect(late.phase).toBe("void");
        expect(blockers(late)).toEqual([]);
    });

    it("changes nothing in the handover", () => {
        const h = checking();
        h.tick("out", "KEYS", "ok", at(10, 13, 5), "Mo");
        h.tick("out", "GAS", "fault", at(10, 13, 6), "Mo", "regulator hisses");
        const before = copyOf({
            phase: h.phase, out: h.checklist("out"), back: h.checklist("back"), timeline: h.timeline(),
            report: h.report(), charges: h.charges(),
        });
        const first = blockers(h);
        first.push("EXTRA");
        first[0] = "CHANGED";
        expect(blockers(h)).toEqual(["GAS", "SAFETY", "HELM", "INVENTORY"]);
        expect({
            phase: h.phase, out: h.checklist("out"), back: h.checklist("back"), timeline: h.timeline(),
            report: h.report(), charges: h.charges(),
        }).toEqual(before);
    });
});

unchanged(mod);
