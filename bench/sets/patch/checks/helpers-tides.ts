// What src/tides.ts does today, pinned case by case. A task's check calls `unchanged` and skips, by name, only the
// cases its own change must alter.
import { describe, expect, it } from "vitest";
import { copyOf } from "./helpers";

type Tides = typeof import("../src/tides");

interface Win {
    opens: number;
    closes: number;
    depth: number;
}

function w(opens: number, closes: number, depth = 60): Win {
    return { opens, closes, depth };
}

export function unchanged(mod: Tides, skip: string[] = []): void {
    const cases: [string, () => void][] = [];
    const pin = (name: string, run: () => void): void => {
        if (cases.some(([had]) => had === name)) throw new Error(`helpers-tides: two cases are called "${name}"`);
        cases.push([name, run]);
    };

    // ------------------------------------------------------------------------------------------ what is exported
    pin("every export is still there", () => {
        const functions = ["boardLine", "clock", "closeFor", "deepEnough", "fits", "isOpen", "lastLeave", "lockDues",
            "nextEntry", "planDeparture", "spare", "windowFor", "windowsFor"];
        for (const name of functions) {
            expect(typeof (mod as Record<string, unknown>)[name], name).toBe("function");
        }
    });
    pin("DAY and SILL are what they were", () => {
        expect(mod.DAY).toBe(1440);
        expect(mod.SILL).toBe(310);
    });

    // ----------------------------------------------------------------------------------------------------- clock
    pin("clock pads the hour and the minute", () => {
        expect(mod.clock(0)).toBe("00:00");
        expect(mod.clock(65)).toBe("01:05");
        expect(mod.clock(549)).toBe("09:09");
        expect(mod.clock(605)).toBe("10:05");
        expect(mod.clock(1439)).toBe("23:59");
    });
    pin("clock shows dashes for a time outside the day", () => {
        expect(mod.clock(1440)).toBe("--:--");
        expect(mod.clock(1500)).toBe("--:--");
        expect(mod.clock(-1)).toBe("--:--");
    });

    // ------------------------------------------------------------------------------------------------- windowFor
    pin("windowFor gives two minutes a centimetre before high water and one and a half after", () => {
        expect(mod.windowFor({ at: 600, height: 370 })).toEqual({ opens: 480, closes: 690, depth: 60 });
        expect(mod.windowFor({ at: 900, height: 350 })).toEqual({ opens: 820, closes: 960, depth: 40 });
    });
    pin("windowFor rounds the minutes after high water down", () => {
        expect(mod.windowFor({ at: 600, height: 335 })).toEqual({ opens: 550, closes: 637, depth: 25 });
        expect(mod.windowFor({ at: 600, height: 345 })).toEqual({ opens: 530, closes: 652, depth: 35 });
    });
    pin("windowFor is null when the sill is covered by less than 25 cm", () => {
        expect(mod.windowFor({ at: 600, height: 334 })).toBeNull();
        expect(mod.windowFor({ at: 600, height: 310 })).toBeNull();
        expect(mod.windowFor({ at: 600, height: 150 })).toBeNull();
    });
    pin("windowFor caps a big tide at 150 minutes before and 110 after", () => {
        expect(mod.windowFor({ at: 600, height: 400 })).toEqual({ opens: 450, closes: 710, depth: 90 });
        expect(mod.windowFor({ at: 600, height: 385 })).toEqual({ opens: 450, closes: 710, depth: 75 });
        expect(mod.windowFor({ at: 600, height: 383 })).toEqual({ opens: 454, closes: 709, depth: 73 });
        expect(mod.windowFor({ at: 600, height: 384 })).toEqual({ opens: 452, closes: 710, depth: 74 });
    });
    pin("windowFor keeps the window inside the day", () => {
        expect(mod.windowFor({ at: 60, height: 370 })).toEqual({ opens: 0, closes: 150, depth: 60 });
        expect(mod.windowFor({ at: 1400, height: 370 })).toEqual({ opens: 1280, closes: 1440, depth: 60 });
    });
    pin("windowFor leaves the tide as it was", () => {
        const tide = { at: 600, height: 370 };
        mod.windowFor(tide);
        expect(tide).toEqual({ at: 600, height: 370 });
    });

    // ------------------------------------------------------------------------------------------------ windowsFor
    pin("windowsFor gives the windows in the order they open", () => {
        const got = mod.windowsFor([{ at: 900, height: 370 }, { at: 200, height: 370 }]);
        expect(got).toEqual([w(80, 290), w(780, 990)]);
    });
    pin("windowsFor leaves out a tide that gives no window", () => {
        const got = mod.windowsFor([{ at: 200, height: 370 }, { at: 560, height: 330 }, { at: 900, height: 350 }]);
        expect(got).toEqual([w(80, 290), w(820, 960, 40)]);
        expect(mod.windowsFor([{ at: 560, height: 330 }])).toEqual([]);
        expect(mod.windowsFor([])).toEqual([]);
    });
    pin("windowsFor joins two windows that overlap and keeps the greater depth", () => {
        // 480 to 690 at 60 cm, then 660 to 905 at 70 cm.
        const got = mod.windowsFor([{ at: 600, height: 370 }, { at: 800, height: 380 }]);
        expect(got).toEqual([w(480, 905, 70)]);
    });
    pin("windowsFor keeps the later closing when a small window lies inside a big one", () => {
        // 450 to 710 at 90 cm, then 560 to 647 at 25 cm.
        const got = mod.windowsFor([{ at: 610, height: 335 }, { at: 600, height: 400 }]);
        expect(got).toEqual([w(450, 710, 90)]);
    });
    pin("windowsFor takes the earlier opening when a small tide comes just ahead of a big one", () => {
        // 550 to 637 at 25 cm, then 460 to 720 at 90 cm.
        const got = mod.windowsFor([{ at: 600, height: 335 }, { at: 610, height: 400 }]);
        expect(got).toEqual([w(460, 720, 90)]);
    });
    pin("windowsFor joins by the order the windows open and not by the order of the high waters", () => {
        // 300 to 475 at 50 cm, then 550 to 637 at 25 cm, then 460 to 720 at 90 cm, which reaches back to the first.
        const got = mod.windowsFor([{ at: 400, height: 360 }, { at: 600, height: 335 }, { at: 610, height: 400 }]);
        expect(got).toEqual([w(300, 720, 90)]);
    });
    pin("windowsFor joins a window to all that was joined before it", () => {
        // 450 to 710 at 90 cm, then 560 to 647 at 25 cm inside it, then 680 to 890 at 60 cm.
        const got = mod.windowsFor([{ at: 600, height: 400 }, { at: 610, height: 335 }, { at: 800, height: 370 }]);
        expect(got).toEqual([w(450, 890, 90)]);
    });
    pin("windowsFor joins two windows that only meet", () => {
        // 480 to 690, then 690 to 900.
        const got = mod.windowsFor([{ at: 600, height: 370 }, { at: 810, height: 370 }]);
        expect(got).toEqual([w(480, 900)]);
    });
    pin("windowsFor keeps apart two windows a minute from each other", () => {
        const got = mod.windowsFor([{ at: 600, height: 370 }, { at: 811, height: 370 }]);
        expect(got).toEqual([w(480, 690), w(691, 901)]);
    });
    pin("windowsFor leaves the tide table in the order it came", () => {
        const table = [{ at: 900, height: 370 }, { at: 200, height: 370 }, { at: 560, height: 330 }];
        const before = copyOf(table);
        mod.windowsFor(table);
        expect(table).toEqual(before);
    });

    // ---------------------------------------------------------------------------------------------------- isOpen
    pin("isOpen takes in the minute a window opens", () => {
        expect(mod.isOpen([w(480, 690)], 480)).toBe(true);
        expect(mod.isOpen([w(480, 690)], 479)).toBe(false);
    });
    pin("isOpen leaves out the minute a window closes", () => {
        expect(mod.isOpen([w(480, 690)], 689)).toBe(true);
        expect(mod.isOpen([w(480, 690)], 690)).toBe(false);
    });
    pin("isOpen looks at every window", () => {
        const day = [w(480, 690), w(780, 990)];
        expect(mod.isOpen(day, 800)).toBe(true);
        expect(mod.isOpen(day, 700)).toBe(false);
        expect(mod.isOpen([], 600)).toBe(false);
    });
    pin("isOpen takes the windows in any order and leaves them as they were", () => {
        const day = [w(780, 990), w(480, 690), w(100, 200)];
        const before = copyOf(day);
        expect(mod.isOpen(day, 500)).toBe(true);
        expect(mod.isOpen(day, 800)).toBe(true);
        expect(mod.isOpen(day, 700)).toBe(false);
        expect(day).toEqual(before);
    });

    // ------------------------------------------------------------------------------------------------------ fits
    pin("fits wants 25 cm under the keel", () => {
        expect(mod.fits(w(480, 690, 60), 35)).toBe(true);
        expect(mod.fits(w(480, 690, 60), 36)).toBe(false);
    });
    pin("fits by the depth of the window and nothing else", () => {
        expect(mod.fits(w(0, 5, 90), 65)).toBe(true);
        expect(mod.fits(w(0, 1440, 90), 66)).toBe(false);
        expect(mod.fits(w(480, 690, 25), 0)).toBe(true);
    });

    // ------------------------------------------------------------------------------------------------ deepEnough
    pin("deepEnough keeps the windows that fit, in their order, as the same objects", () => {
        const day = [w(80, 290, 40), w(480, 690, 80), w(780, 990, 55)];
        const got = mod.deepEnough(day, 30);
        expect(got).toHaveLength(2);
        expect(got[0]).toBe(day[1]);
        expect(got[1]).toBe(day[2]);
    });
    pin("deepEnough gives a new list and leaves the old one", () => {
        const day = [w(480, 690, 80), w(80, 290, 40)];
        const before = copyOf(day);
        const all = mod.deepEnough(day, 10);
        expect(all).not.toBe(day);
        expect(all).toEqual(before);
        expect(mod.deepEnough(day, 56)).toEqual([]);
        expect(day).toEqual(before);
    });

    // ------------------------------------------------------------------------------------------------- nextEntry
    pin("nextEntry is now when the lock is open", () => {
        expect(mod.nextEntry([w(480, 690)], 500)).toBe(500);
        expect(mod.nextEntry([w(480, 690)], 480)).toBe(480);
        expect(mod.nextEntry([w(0, 150)], 0)).toBe(0);
    });
    pin("nextEntry is the opening of the next window when the lock is shut", () => {
        expect(mod.nextEntry([w(480, 690)], 100)).toBe(480);
        expect(mod.nextEntry([w(480, 690), w(780, 990)], 700)).toBe(780);
    });
    pin("nextEntry takes a boat that will be out just as the gates shut", () => {
        expect(mod.nextEntry([w(480, 690), w(780, 990)], 678)).toBe(678);
    });
    pin("nextEntry goes to the next window when there is no time to lock through", () => {
        expect(mod.nextEntry([w(480, 690), w(780, 990)], 679)).toBe(780);
        expect(mod.nextEntry([w(480, 690), w(780, 990)], 689)).toBe(780);
    });
    pin("nextEntry passes over a window too short to lock through", () => {
        expect(mod.nextEntry([w(100, 111), w(300, 400)], 0)).toBe(300);
        expect(mod.nextEntry([w(100, 112), w(300, 400)], 0)).toBe(100);
    });
    pin("nextEntry is DAY when nothing is left", () => {
        expect(mod.nextEntry([w(480, 690)], 679)).toBe(1440);
        expect(mod.nextEntry([w(480, 690), w(780, 990)], 979)).toBe(1440);
        expect(mod.nextEntry([], 600)).toBe(1440);
    });
    pin("nextEntry leaves the windows as they were", () => {
        const day = [w(480, 690), w(780, 990)];
        const before = copyOf(day);
        mod.nextEntry(day, 600);
        mod.nextEntry(day, 1000);
        expect(day).toEqual(before);
        // It is not for nextEntry to put right a list that came in another order.
        const mixed = [w(780, 990), w(480, 690)];
        mod.nextEntry(mixed, 0);
        mod.nextEntry(mixed, 1000);
        expect(mixed).toEqual([w(780, 990), w(480, 690)]);
    });

    // ------------------------------------------------------------------------------------------------- lastLeave
    pin("lastLeave allows for the locking and the cruise", () => {
        expect(mod.lastLeave(w(480, 690), 40)).toBe(638);
        expect(mod.lastLeave(w(480, 690), 0)).toBe(678);
    });
    pin("lastLeave goes below zero for the day before", () => {
        expect(mod.lastLeave(w(0, 50), 60)).toBe(-22);
    });

    // ----------------------------------------------------------------------------------------------------- spare
    pin("spare counts down to the last minute a boat can go in", () => {
        expect(mod.spare([w(480, 690)], 480)).toBe(198);
        expect(mod.spare([w(480, 690)], 600)).toBe(78);
        expect(mod.spare([w(480, 690)], 677)).toBe(1);
    });
    pin("spare is 0 from the last minute a boat can go in", () => {
        expect(mod.spare([w(480, 690)], 678)).toBe(0);
        expect(mod.spare([w(480, 690)], 689)).toBe(0);
    });
    pin("spare is 0 when the lock is shut", () => {
        expect(mod.spare([w(480, 690)], 479)).toBe(0);
        expect(mod.spare([w(480, 690)], 690)).toBe(0);
        expect(mod.spare([], 600)).toBe(0);
    });
    pin("spare looks at every window", () => {
        expect(mod.spare([w(480, 690), w(780, 990)], 900)).toBe(78);
        expect(mod.spare([w(480, 690), w(780, 990)], 700)).toBe(0);
    });
    pin("spare takes the windows in any order and leaves them as they were", () => {
        const day = [w(780, 990), w(480, 690)];
        const before = copyOf(day);
        expect(mod.spare(day, 600)).toBe(78);
        expect(mod.spare(day, 900)).toBe(78);
        expect(mod.spare(day, 700)).toBe(0);
        expect(day).toEqual(before);
    });

    // ------------------------------------------------------------------------------------------------- boardLine
    pin("boardLine gives the opening, the last entry and the depth", () => {
        expect(mod.boardLine(w(480, 690, 60))).toBe("08:00 to 11:18, 60 cm over the sill");
        expect(mod.boardLine(w(65, 300, 105))).toBe("01:05 to 04:48, 105 cm over the sill");
    });
    pin("boardLine of a window that runs to midnight", () => {
        expect(mod.boardLine(w(1280, 1440, 45))).toBe("21:20 to 23:48, 45 cm over the sill");
    });
    pin("boardLine shows dashes when the last entry is before the day begins", () => {
        expect(mod.boardLine(w(0, 10, 30))).toBe("00:00 to --:--, 30 cm over the sill");
    });
    pin("boardLine takes the locking off the closing time even of a window shorter than a locking", () => {
        expect(mod.boardLine(w(480, 490, 30))).toBe("08:00 to 07:58, 30 cm over the sill");
        expect(mod.boardLine(w(480, 492, 30))).toBe("08:00 to 08:00, 30 cm over the sill");
    });

    // -------------------------------------------------------------------------------------------------- lockDues
    pin("lockDues is 85 pence for each whole metre", () => {
        expect(mod.lockDues(12, 600)).toBe(1020);
        expect(mod.lockDues(1, 600)).toBe(85);
    });
    pin("lockDues is nothing for a length of nothing", () => {
        expect(mod.lockDues(0, 600)).toBe(0);
        expect(mod.lockDues(0, 300)).toBe(0);
    });
    pin("lockDues counts a part of a metre as a whole one", () => {
        expect(mod.lockDues(12.1, 600)).toBe(1105);
        expect(mod.lockDues(17.99, 600)).toBe(1530);
    });
    pin("lockDues adds a half outside the keeper's hours, rounded down to a penny", () => {
        expect(mod.lockDues(13, 300)).toBe(1657);
        expect(mod.lockDues(12, 1300)).toBe(1530);
    });
    pin("lockDues has the keeper there from 06:00 and gone at 20:00", () => {
        expect(mod.lockDues(13, 359)).toBe(1657);
        expect(mod.lockDues(13, 360)).toBe(1105);
        expect(mod.lockDues(13, 1199)).toBe(1105);
        expect(mod.lockDues(13, 1200)).toBe(1657);
    });

    // -------------------------------------------------------------------------------------------------- closeFor
    pin("closeFor cuts a window in two and gives the minutes lost", () => {
        const day = [w(480, 690)];
        expect(mod.closeFor(day, 540, 600)).toBe(60);
        expect(day).toEqual([w(480, 540), w(600, 690)]);
    });
    pin("closeFor changes the list it is given and not the windows that were in it", () => {
        const first = w(480, 690, 70);
        const second = w(780, 990, 50);
        const day = [first, second];
        mod.closeFor(day, 540, 600);
        expect(day).toHaveLength(3);
        expect(first).toEqual(w(480, 690, 70));
        expect(day[2]).toBe(second);
    });
    pin("closeFor trims the end of a window", () => {
        const day = [w(480, 690)];
        expect(mod.closeFor(day, 600, 800)).toBe(90);
        expect(day).toEqual([w(480, 600)]);
    });
    pin("closeFor trims the start of a window", () => {
        const day = [w(480, 690)];
        expect(mod.closeFor(day, 400, 540)).toBe(60);
        expect(day).toEqual([w(540, 690)]);
    });
    pin("closeFor leaves a window it trims as it was and puts a new one in the list", () => {
        const first = w(480, 690, 70);
        const day = [first];
        expect(mod.closeFor(day, 600, 800)).toBe(90);
        expect(day).toEqual([w(480, 600, 70)]);
        expect(first).toEqual(w(480, 690, 70));
        const second = w(480, 690, 70);
        const other = [second];
        expect(mod.closeFor(other, 400, 540)).toBe(60);
        expect(other).toEqual([w(540, 690, 70)]);
        expect(second).toEqual(w(480, 690, 70));
    });
    pin("closeFor takes the windows in any order and keeps them in the order they came", () => {
        const day = [w(780, 990), w(480, 690)];
        expect(mod.closeFor(day, 690, 780)).toBe(0);
        expect(day).toEqual([w(780, 990), w(480, 690)]);
        expect(mod.closeFor(day, 800, 900)).toBe(100);
        expect(day).toEqual([w(780, 800), w(900, 990), w(480, 690)]);
    });
    pin("closeFor takes out a window it covers", () => {
        const day = [w(480, 690), w(780, 990)];
        expect(mod.closeFor(day, 480, 690)).toBe(210);
        expect(day).toEqual([w(780, 990)]);
        expect(mod.closeFor(day, 0, 1440)).toBe(210);
        expect(day).toEqual([]);
    });
    pin("closeFor takes out two windows next to each other in the list", () => {
        const day = [w(100, 200), w(480, 690), w(780, 990)];
        expect(mod.closeFor(day, 50, 700)).toBe(310);
        expect(day).toEqual([w(780, 990)]);
    });
    pin("closeFor reaches across two windows", () => {
        const day = [w(480, 690), w(780, 990, 45)];
        expect(mod.closeFor(day, 600, 840)).toBe(150);
        expect(day).toEqual([w(480, 600), w(840, 990, 45)]);
    });
    pin("closeFor keeps the list in order and each piece at the depth of its window", () => {
        const day = [w(100, 300, 40), w(480, 690, 70), w(780, 990, 50)];
        expect(mod.closeFor(day, 500, 600)).toBe(100);
        expect(day).toEqual([w(100, 300, 40), w(480, 500, 70), w(600, 690, 70), w(780, 990, 50)]);
    });
    pin("closeFor does nothing between windows or for an empty stretch", () => {
        const day = [w(480, 690), w(780, 990)];
        const before = copyOf(day);
        expect(mod.closeFor(day, 690, 780)).toBe(0);
        expect(mod.closeFor(day, 600, 600)).toBe(0);
        expect(mod.closeFor(day, 650, 600)).toBe(0);
        expect(mod.closeFor(day, 1000, 1440)).toBe(0);
        expect(day).toEqual(before);
    });
    pin("closeFor keeps a piece of a few minutes", () => {
        const day = [w(480, 690)];
        expect(mod.closeFor(day, 485, 600)).toBe(115);
        expect(day).toEqual([w(480, 485), w(600, 690)]);
        const other = [w(480, 690)];
        expect(mod.closeFor(other, 600, 685)).toBe(85);
        expect(other).toEqual([w(480, 600), w(685, 690)]);
    });

    // --------------------------------------------------------------------------------------------- planDeparture
    pin("planDeparture leaves at once when the lock is open on arrival", () => {
        expect(mod.planDeparture([w(480, 690)], 500, 40)).toEqual({ leave: 500, enter: 540, clear: 552, held: 0 });
    });
    pin("planDeparture holds the boat at the yard so that it arrives as the lock opens", () => {
        expect(mod.planDeparture([w(480, 690)], 300, 40)).toEqual({ leave: 440, enter: 480, clear: 492, held: 140 });
    });
    pin("planDeparture goes in at the last minute there is time to lock through", () => {
        expect(mod.planDeparture([w(480, 690)], 638, 40)).toEqual({ leave: 638, enter: 678, clear: 690, held: 0 });
    });
    pin("planDeparture goes for the next window when the first cannot be made", () => {
        const day = [w(480, 690), w(780, 990)];
        expect(mod.planDeparture(day, 650, 30)).toEqual({ leave: 750, enter: 780, clear: 792, held: 100 });
    });
    pin("planDeparture leaves the windows as they were", () => {
        const day = [w(480, 690), w(780, 990)];
        const before = copyOf(day);
        mod.planDeparture(day, 650, 30);
        expect(day).toEqual(before);
        // Nor is it for planDeparture to put right a list that came in another order.
        const mixed = [w(780, 990), w(480, 690)];
        mod.planDeparture(mixed, 0, 0);
        expect(mixed).toEqual([w(780, 990), w(480, 690)]);
    });
    pin("planDeparture plans for a lock that is open in the first minute of the day", () => {
        expect(mod.planDeparture([w(0, 150)], 0, 0)).toEqual({ leave: 0, enter: 0, clear: 12, held: 0 });
    });
    pin("planDeparture gives a plan even when nothing is left", () => {
        expect(mod.planDeparture([w(480, 690)], 700, 30)).toEqual({ leave: 1410, enter: 1440, clear: 1452, held: 710 });
    });

    const unknown = skip.filter((name) => !cases.some(([had]) => had === name));
    if (unknown.length > 0) throw new Error(`helpers-tides: no case is called ${JSON.stringify(unknown)}`);

    describe("tides: what the change must leave alone", () => {
        for (const [name, run] of cases) {
            if (!skip.includes(name)) it(name, run);
        }
    });
}
