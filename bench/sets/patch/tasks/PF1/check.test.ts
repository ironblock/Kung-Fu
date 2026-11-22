import { describe, expect, it } from "vitest";
import * as mod from "../src/worklog";
import { copyOf } from "./helpers";
import { unchanged } from "./helpers-worklog";

type Log = InstanceType<typeof mod.WorkLog>;

function partsBySku(log: Log): Map<string, number> {
    return (log as unknown as { partsBySku(): Map<string, number> }).partsBySku();
}

function sorted(map: Map<string, number>): [string, number][] {
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
}

/** Four jobs on two boats. Job 3 will be dropped by the cases that want one dropped. */
function yard(): Log {
    const log = new mod.WorkLog();
    log.open("Kestrel", "Stern gland weeping", "urgent", 10, "Ann"); // 1
    log.open("Heron", "Tiller loose", "soon", 11, "Ann"); // 2
    log.open("Kestrel", "Horn dead", "routine", 12, "Bo"); // 3
    log.open("Avocet", "Fender eyes", "routine", 12, "Bo"); // 4
    log.usePart(1, "gland-28", 2, 1999);
    log.usePart(1, "GLAND-28", 1, 2100);
    log.usePart(1, "grease", 1, 350);
    log.usePart(2, "GLAND-28", 4, 1999);
    log.usePart(2, "PIN-6", 3, 40);
    log.usePart(3, "HORN-12V", 1, 2450);
    log.usePart(3, "PIN-6", 2, 40);
    return log;
}

describe("WorkLog.partsBySku", () => {
    it("gives a Map", () => {
        expect(partsBySku(yard())).toBeInstanceOf(Map);
    });

    it("sums a part number over the lines of one job, whatever the unit price", () => {
        const log = new mod.WorkLog();
        log.open("Kestrel", "Stern gland weeping", "urgent", 10, "Ann");
        log.usePart(1, "GLAND-28", 2, 1999);
        log.usePart(1, "GLAND-28", 1, 2100);
        log.usePart(1, "GLAND-28", 5, 0);
        expect(log.get(1)?.parts.length).toBe(3);
        expect(sorted(partsBySku(log))).toEqual([["GLAND-28", 8]]);
    });

    it("sums a part number across the jobs, with one entry for each part number", () => {
        expect(sorted(partsBySku(yard()))).toEqual([
            ["GLAND-28", 7],
            ["GREASE", 1],
            ["HORN-12V", 1],
            ["PIN-6", 5],
        ]);
    });

    it("keys each entry by the sku as it is stored on the lines", () => {
        const got = partsBySku(yard());
        expect(got.get("GREASE")).toBe(1);
        expect(got.has("grease")).toBe(false);
        expect(got.has("gland-28")).toBe(false);
    });

    it("keys a line put on the job by hand by its sku exactly as it is stored, with no trimming or capitals", () => {
        const log = new mod.WorkLog();
        log.open("Kestrel", "Stern gland weeping", "urgent", 10, "Ann");
        log.usePart(1, "PIN-6", 2, 40);
        log.get(1)?.parts.push({ sku: "pin-6 ", qty: 1, unitPence: 40 });
        expect(sorted(partsBySku(log))).toEqual([
            ["PIN-6", 2],
            ["pin-6 ", 1],
        ]);
    });

    it("leaves out a dropped job, and a part number only a dropped job has", () => {
        const log = yard();
        expect(log.move(3, "dropped", 13, "Ann")).toBe(true);
        expect(sorted(partsBySku(log))).toEqual([
            ["GLAND-28", 7],
            ["GREASE", 1],
            ["PIN-6", 3],
        ]);
        expect(partsBySku(log).has("HORN-12V")).toBe(false);
    });

    it("counts the jobs that are waiting, done and signed", () => {
        const log = yard();
        log.move(1, "started", 10, "Ann");
        log.move(1, "done", 12, "Ann");
        log.move(1, "signed", 13, "Bo");
        log.move(2, "booked", 12, "Ann");
        log.move(2, "started", 13, "Ann");
        log.move(2, "done", 14, "Ann");
        log.move(4, "booked", 12, "Ann");
        log.move(4, "waiting", 13, "Ann");
        log.usePart(4, "EYE-8", 6, 120);
        expect([1, 2, 3, 4].map((id) => log.get(id)?.state)).toEqual(["signed", "done", "reported", "waiting"]);
        expect(sorted(partsBySku(log))).toEqual([
            ["EYE-8", 6],
            ["GLAND-28", 7],
            ["GREASE", 1],
            ["HORN-12V", 1],
            ["PIN-6", 5],
        ]);
    });

    it("counts the jobs that are booked and started", () => {
        const log = new mod.WorkLog();
        log.open("Kestrel", "Stern gland weeping", "urgent", 10, "Ann"); // 1
        log.open("Heron", "Tiller loose", "soon", 11, "Ann"); // 2
        log.move(1, "booked", 11, "Ann");
        log.move(2, "booked", 11, "Ann");
        log.move(2, "started", 12, "Bo");
        log.usePart(1, "PIN-6", 2, 40);
        log.usePart(2, "EYE-8", 1, 120);
        log.usePart(2, "PIN-6", 1, 40);
        expect([1, 2].map((id) => log.get(id)?.state)).toEqual(["booked", "started"]);
        expect(sorted(partsBySku(log))).toEqual([
            ["EYE-8", 1],
            ["PIN-6", 3],
        ]);
    });

    it("follows a return", () => {
        const log = yard();
        log.usePart(2, "GLAND-28", -3, 1999);
        log.usePart(1, "GREASE", -1, 350);
        expect(sorted(partsBySku(log))).toEqual([
            ["GLAND-28", 4],
            ["HORN-12V", 1],
            ["PIN-6", 5],
        ]);
    });

    it("gives an empty map for a log with no jobs, and for one with no parts", () => {
        expect(partsBySku(new mod.WorkLog()).size).toBe(0);
        const log = new mod.WorkLog();
        log.open("Kestrel", "Horn dead", "routine", 12, "Bo");
        log.open("Heron", "Tiller loose", "soon", 12, "Bo");
        expect(partsBySku(log).size).toBe(0);
    });

    it("does not change the log or its jobs", () => {
        const log = yard();
        log.move(3, "dropped", 13, "Ann");
        // Lines that are not in the order of their skus, so that sorting them would show.
        log.usePart(4, "ROPE-10", 1, 900);
        log.usePart(4, "EYE-8", 2, 120);
        expect(log.get(4)?.parts.map((p) => p.sku)).toEqual(["ROPE-10", "EYE-8"]);
        const before = [1, 2, 3, 4].map((id) => copyOf(log.get(id)));
        partsBySku(log);
        partsBySku(log).set("PIN-6", 99);
        expect([1, 2, 3, 4].map((id) => log.get(id))).toEqual(before);
        expect(log.count).toBe(4);
        expect(partsBySku(log).get("PIN-6")).toBe(3);
        expect(log.open("Heron", "Gas locker hinge", "soon", 14, "Bo")).toBe(5);
    });
});

unchanged(mod);
