// What src/notices.ts does now, pinned case by case. A task's check calls `unchanged` and skips, by name,
// only the cases its change must alter.
import { describe, expect, it } from "vitest";
import { copyOf } from "./helpers";

type Mod = typeof import("../src/notices");
type Booking = import("../src/notices").Booking;
type Notice = import("../src/notices").Notice;
type Rule = import("../src/notices").Rule;
type QuietHours = import("../src/notices").QuietHours;
type Box = InstanceType<Mod["Outbox"]>;

const SIGN = "Lowmere Wharf\n01632 960144";

/** A day and a time of day as one stamp. Worked out here, not by the module. */
function at(day: number, min: number): number {
    return day * 1440 + min;
}

/** Booked on day 100 (Wed 10 Apr 2024), out on day 187 (Sat 6 Jul), back on day 194 (Sat 13 Jul). */
function booking(over: Partial<Booking> = {}): Booking {
    const base: Booking = {
        ref: "LW-2041",
        name: "Priya Okafor",
        boat: "Kingfisher",
        bookedDay: 100,
        startDay: 187,
        endDay: 194,
        party: 4,
        balancePence: 64500,
        depositPence: 15000,
        email: "Priya@Okafor.example",
        phone: "07700 900123",
        address: "4 Mill Lane\n  Otterby \n\nOT4 2QQ",
    };
    return { ...base, ...over };
}

function notice(over: Partial<Notice> = {}): Notice {
    const base: Notice = {
        id: 1,
        ref: "LW-2041",
        kind: "arrival",
        channel: "sms",
        to: "+447700900123",
        subject: "",
        body: "Kingfisher is ready.",
        dueAt: at(185, 600),
        state: "queued",
        tries: 0,
        sentAt: -1,
    };
    return { ...base, ...over };
}

/** The time the standard booking is planned at: 10.15am on the day it was booked. */
const NOW = at(100, 615);

/** What planning the standard booking at NOW queues, as the module gives it today. */
function six(): Notice[] {
    return [
        {
            id: 1,
            ref: "LW-2041",
            kind: "confirmation",
            channel: "email",
            to: "priya@okafor.example",
            subject: "Booking LW-2041 confirmed: Kingfisher from Sat 6 Jul",
            body:
                "Dear Priya,\n\nThank you for booking Kingfisher for 7 nights, Sat 6 Jul to Sat 13 Jul, " +
                "for a party of 4.\nYour reference is LW-2041. Please quote it if you write or ring.\n\n" +
                SIGN,
            dueAt: NOW,
            state: "queued",
            tries: 0,
            sentAt: -1,
        },
        {
            id: 2,
            ref: "LW-2041",
            kind: "balance",
            channel: "email",
            to: "priya@okafor.example",
            subject: "Balance due for Kingfisher, booking LW-2041",
            body:
                "Dear Priya,\n\nThe balance of £645 for your hire of Kingfisher from Sat 6 Jul is due by " +
                "Sat 8 Jun.\nYou can pay by card on 01632 960144, quoting LW-2041.\n\n" +
                SIGN,
            dueAt: at(145, 540),
            state: "queued",
            tries: 0,
            sentAt: -1,
        },
        {
            id: 3,
            ref: "LW-2041",
            kind: "arrival",
            channel: "sms",
            to: "+447700900123",
            subject: "",
            body:
                "Lowmere Wharf: Kingfisher will be ready for you from 2.30pm on Sat 6 Jul. " +
                "Ref LW-2041. Bring this text.",
            dueAt: at(185, 600),
            state: "queued",
            tries: 0,
            sentAt: -1,
        },
        {
            id: 4,
            ref: "LW-2041",
            kind: "return",
            channel: "sms",
            to: "+447700900123",
            subject: "",
            body:
                "Lowmere Wharf: please have Kingfisher back by 9.30am tomorrow, Sat 13 Jul, " +
                "with the tanks pumped out.",
            dueAt: at(193, 1050),
            state: "queued",
            tries: 0,
            sentAt: -1,
        },
        {
            id: 5,
            ref: "LW-2041",
            kind: "thanks",
            channel: "email",
            to: "priya@okafor.example",
            subject: "Thank you from Lowmere Wharf",
            body:
                "Dear Priya,\n\nThank you for hiring Kingfisher. We hope the 7 nights went well, " +
                "and that we see you again.\n\n" +
                SIGN,
            dueAt: at(195, 660),
            state: "queued",
            tries: 0,
            sentAt: -1,
        },
        {
            id: 6,
            ref: "LW-2041",
            kind: "deposit",
            channel: "email",
            to: "priya@okafor.example",
            subject: "Your deposit for booking LW-2041",
            body:
                "Dear Priya,\n\nKingfisher has been checked over, and your deposit of £150 is on its way " +
                "back to your card.\n\n" +
                SIGN,
            dueAt: at(201, 540),
            state: "queued",
            tries: 0,
            sentAt: -1,
        },
    ];
}

const RULE_TABLE: Rule[] = [
    { kind: "confirmation", anchor: "booked", offsetDays: 0, atMin: 0, channels: ["email", "post"], late: "send" },
    { kind: "balance", anchor: "start", offsetDays: -42, atMin: 540, channels: ["email", "post"], late: "send" },
    { kind: "arrival", anchor: "start", offsetDays: -2, atMin: 600, channels: ["sms", "email"], late: "send" },
    { kind: "return", anchor: "end", offsetDays: -1, atMin: 1050, channels: ["sms"], late: "skip" },
    { kind: "thanks", anchor: "end", offsetDays: 1, atMin: 660, channels: ["email"], late: "skip" },
    { kind: "deposit", anchor: "end", offsetDays: 7, atMin: 540, channels: ["email", "post"], late: "send" },
];

export function unchanged(mod: Mod, skip: string[] = []): void {
    const names = new Set<string>();
    const pin = (name: string, run: () => void): void => {
        if (names.has(name)) {
            throw new Error(`two cases are called "${name}"`);
        }
        names.add(name);
        if (!skip.includes(name)) {
            it(name, run);
        }
    };

    /** A new outbox with the standard booking planned at NOW: notices 1 to 6. */
    const planned = (quiet?: QuietHours): Box => {
        const box = quiet ? new mod.Outbox(quiet) : new mod.Outbox();
        box.plan(booking(), NOW);
        return box;
    };
    const ids = (list: Notice[]): number[] => list.map((n) => n.id);

    describe("notices as it was", () => {
        // ------------------------------------------------------------------------------ constants
        pin("constants: DAY_MIN is 1440, and NO_STAMP, NO_MIN and GIVE_UP are -1", () => {
            expect(mod.DAY_MIN).toBe(1440);
            expect(mod.NO_STAMP).toBe(-1);
            expect(mod.NO_MIN).toBe(-1);
            expect(mod.GIVE_UP).toBe(-1);
        });
        pin("constants: a text is 160 characters alone, 153 a part when joined, 3 parts at most", () => {
            expect(mod.SMS_SINGLE).toBe(160);
            expect(mod.SMS_MULTI).toBe(153);
            expect(mod.SMS_MAX_PARTS).toBe(3);
        });
        pin("constants: handover at 870, back by 570, the balance notice 42 days ahead", () => {
            expect(mod.HANDOVER_MIN).toBe(870);
            expect(mod.RETURN_BY_MIN).toBe(570);
            expect(mod.BALANCE_DAYS).toBe(42);
        });
        pin("constants: DEFAULT_QUIET runs from 1260 to 480", () => {
            expect(mod.DEFAULT_QUIET).toEqual({ fromMin: 1260, toMin: 480 });
        });
        pin("RULES: one rule for each kind, in the order of a hire", () => {
            expect(mod.RULES.map((r) => r.kind)).toEqual([
                "confirmation",
                "balance",
                "arrival",
                "return",
                "thanks",
                "deposit",
            ]);
        });
        pin("RULES: each rule's anchor, offset, time of day, channels and lateness", () => {
            expect(mod.RULES.map((r) => ({ ...r, channels: [...r.channels] }))).toEqual(RULE_TABLE);
        });

        // --------------------------------------------------------------------------------- stamps
        pin("stampOf: a day and a time of day make day * 1440 + minutes", () => {
            expect(mod.stampOf(0, 0)).toBe(0);
            expect(mod.stampOf(1, 0)).toBe(1440);
            expect(mod.stampOf(100, 615)).toBe(144615);
            expect(mod.stampOf(-1, 1439)).toBe(-1);
        });
        pin("stampOf: minutes past the end of the day run on into the next day", () => {
            expect(mod.stampOf(2, 1500)).toBe(4380);
            expect(mod.stampOf(2, -60)).toBe(2820);
        });
        pin("dayOf: the day a stamp is in, to its last minute", () => {
            expect(mod.dayOf(144615)).toBe(100);
            expect(mod.dayOf(0)).toBe(0);
            expect(mod.dayOf(1439)).toBe(0);
            expect(mod.dayOf(1440)).toBe(1);
        });
        pin("dayOf: a stamp before day 0 is in an earlier day, not in day 0", () => {
            expect(mod.dayOf(-1)).toBe(-1);
            expect(mod.dayOf(-1440)).toBe(-1);
            expect(mod.dayOf(-1441)).toBe(-2);
        });
        pin("minOf: the minutes from midnight of a stamp", () => {
            expect(mod.minOf(144615)).toBe(615);
            expect(mod.minOf(1440)).toBe(0);
            expect(mod.minOf(1439)).toBe(1439);
        });
        pin("minOf: counts from midnight for a stamp before day 0 too", () => {
            expect(mod.minOf(-1)).toBe(1439);
            expect(mod.minOf(-1440)).toBe(0);
            expect(mod.minOf(-1500)).toBe(1380);
        });

        // ---------------------------------------------------------------------------------- dates
        pin("weekdayOf: day 0 is a Monday, and Monday is 0", () => {
            expect([0, 1, 5, 6, 7, 187].map((d) => mod.weekdayOf(d))).toEqual([0, 1, 5, 6, 0, 5]);
        });
        pin("weekdayOf: counts back through the days before day 0", () => {
            expect([-1, -2, -7, -8].map((d) => mod.weekdayOf(d))).toEqual([6, 5, 0, 6]);
        });
        pin("dateOf: day 0 is 1 January 2024, with the month counted from 1", () => {
            expect(mod.dateOf(0)).toEqual({ year: 2024, month: 1, date: 1, weekday: 0 });
            expect(mod.dateOf(187)).toEqual({ year: 2024, month: 7, date: 6, weekday: 5 });
        });
        pin("dateOf: 2024 has a 29 February and 2025 has none", () => {
            expect(mod.dateOf(59)).toEqual({ year: 2024, month: 2, date: 29, weekday: 3 });
            expect(mod.dateOf(60)).toEqual({ year: 2024, month: 3, date: 1, weekday: 4 });
            expect(mod.dateOf(424)).toEqual({ year: 2025, month: 2, date: 28, weekday: 4 });
            expect(mod.dateOf(425)).toEqual({ year: 2025, month: 3, date: 1, weekday: 5 });
        });
        pin("dateOf: the turn of a year, forward and back", () => {
            expect(mod.dateOf(365)).toEqual({ year: 2024, month: 12, date: 31, weekday: 1 });
            expect(mod.dateOf(366)).toEqual({ year: 2025, month: 1, date: 1, weekday: 2 });
            expect(mod.dateOf(731)).toEqual({ year: 2026, month: 1, date: 1, weekday: 3 });
            expect(mod.dateOf(-1)).toEqual({ year: 2023, month: 12, date: 31, weekday: 6 });
            expect(mod.dateOf(-366)).toEqual({ year: 2022, month: 12, date: 31, weekday: 5 });
            // Back over 2020, a leap year.
            expect(mod.dateOf(-1461)).toEqual({ year: 2020, month: 1, date: 1, weekday: 2 });
            expect(mod.dateOf(-1462)).toEqual({ year: 2019, month: 12, date: 31, weekday: 1 });
        });
        pin("dateOf: a century year is a leap year only when 400 divides it", () => {
            // The day after 28 February 2100, and the day after 28 February 2000.
            expect(mod.dateOf(27818)).toEqual({ year: 2100, month: 3, date: 1, weekday: 0 });
            expect(mod.dateOf(-8707)).toEqual({ year: 2000, month: 2, date: 29, weekday: 1 });
        });
        pin("formatDay: weekday, date and month, with no nought before the date", () => {
            expect(mod.formatDay(187)).toBe("Sat 6 Jul");
            expect(mod.formatDay(0)).toBe("Mon 1 Jan");
            expect(mod.formatDay(59)).toBe("Thu 29 Feb");
            expect(mod.formatDay(346)).toBe("Thu 12 Dec");
        });
        pin("formatDay: the year comes last, and only when asked for", () => {
            expect(mod.formatDay(187, true)).toBe("Sat 6 Jul 2024");
            expect(mod.formatDay(366, true)).toBe("Wed 1 Jan 2025");
            expect(mod.formatDay(366, false)).toBe("Wed 1 Jan");
            expect(mod.formatDay(-1, true)).toBe("Sun 31 Dec 2023");
        });
        pin("formatDay: each weekday by its three letters", () => {
            expect([0, 1, 2, 3, 4, 5, 6].map((d) => mod.formatDay(d))).toEqual([
                "Mon 1 Jan",
                "Tue 2 Jan",
                "Wed 3 Jan",
                "Thu 4 Jan",
                "Fri 5 Jan",
                "Sat 6 Jan",
                "Sun 7 Jan",
            ]);
        });
        pin("formatDay: each month by its three letters", () => {
            // The 15th of each month of 2024.
            expect([14, 45, 74, 105, 135, 166, 196, 227, 258, 288, 319, 349].map((d) => mod.formatDay(d))).toEqual([
                "Mon 15 Jan",
                "Thu 15 Feb",
                "Fri 15 Mar",
                "Mon 15 Apr",
                "Wed 15 May",
                "Sat 15 Jun",
                "Mon 15 Jul",
                "Thu 15 Aug",
                "Sun 15 Sep",
                "Tue 15 Oct",
                "Fri 15 Nov",
                "Sun 15 Dec",
            ]);
        });

        // ---------------------------------------------------------------------------------- times
        pin("formatMin: a whole hour has no minutes, and the hours run 1 to 12", () => {
            expect(mod.formatMin(540)).toBe("9am");
            expect(mod.formatMin(780)).toBe("1pm");
            expect(mod.formatMin(60)).toBe("1am");
            expect(mod.formatMin(1380)).toBe("11pm");
        });
        pin("formatMin: minutes follow a dot, two digits, with am or pm closed up", () => {
            expect(mod.formatMin(870)).toBe("2.30pm");
            expect(mod.formatMin(605)).toBe("10.05am");
            expect(mod.formatMin(1439)).toBe("11.59pm");
        });
        pin("formatMin: noon and midnight are words, and the hour after each is 12", () => {
            expect(mod.formatMin(0)).toBe("midnight");
            expect(mod.formatMin(720)).toBe("noon");
            expect(mod.formatMin(5)).toBe("12.05am");
            expect(mod.formatMin(725)).toBe("12.05pm");
        });
        pin("formatMin: a time outside the day is brought into it", () => {
            expect(mod.formatMin(1440)).toBe("midnight");
            expect(mod.formatMin(1500)).toBe("1am");
            expect(mod.formatMin(-30)).toBe("11.30pm");
        });
        pin("formatMin: a part of a minute is dropped, not rounded", () => {
            expect(mod.formatMin(59.6)).toBe("12.59am");
            expect(mod.formatMin(719.5)).toBe("11.59am");
            expect(mod.formatMin(-0.5)).toBe("11.59pm");
        });
        pin("formatStamp: the day, then at, then the time", () => {
            expect(mod.formatStamp(at(187, 870))).toBe("Sat 6 Jul at 2.30pm");
            expect(mod.formatStamp(NOW)).toBe("Wed 10 Apr at 10.15am");
            expect(mod.formatStamp(0)).toBe("Mon 1 Jan at midnight");
        });
        pin("formatStamp: NO_STAMP reads not yet", () => {
            expect(mod.formatStamp(-1)).toBe("not yet");
            expect(mod.formatStamp(-2)).toBe("Sun 31 Dec at 11.58pm");
        });
        pin("parseClock: hours and minutes with a colon or a dot", () => {
            expect(mod.parseClock("21:00")).toBe(1260);
            expect(mod.parseClock("9.30")).toBe(570);
            expect(mod.parseClock(" 07:05 ")).toBe(425);
            expect(mod.parseClock("0:00")).toBe(0);
            expect(mod.parseClock("23:59")).toBe(1439);
        });
        pin("parseClock: -1 for what is not a time of day", () => {
            for (const text of [
                "24:00",
                "9:60",
                "9",
                "9:5",
                "",
                "ab:cd",
                "930",
                "9:30pm",
                "-1:30",
                "1:2:3",
                "9 : 30",
                "9: 30",
                "9 :30",
            ]) {
                expect(mod.parseClock(text), text).toBe(-1);
            }
        });

        // ---------------------------------------------------------------------------------- money
        pin("formatPence: whole pounds are written without pence", () => {
            expect(mod.formatPence(64500)).toBe("£645");
            expect(mod.formatPence(0)).toBe("£0");
            expect(mod.formatPence(100)).toBe("£1");
        });
        pin("formatPence: pence take two digits", () => {
            expect(mod.formatPence(64550)).toBe("£645.50");
            expect(mod.formatPence(5)).toBe("£0.05");
            expect(mod.formatPence(199)).toBe("£1.99");
        });
        pin("formatPence: thousands are set off with commas", () => {
            expect(mod.formatPence(100000)).toBe("£1,000");
            expect(mod.formatPence(123456789)).toBe("£1,234,567.89");
            expect(mod.formatPence(99999)).toBe("£999.99");
        });
        pin("formatPence: the minus goes before the pound sign, and a part of a penny is rounded", () => {
            expect(mod.formatPence(-550)).toBe("-£5.50");
            expect(mod.formatPence(-120000)).toBe("-£1,200");
            expect(mod.formatPence(99.6)).toBe("£1");
            expect(mod.formatPence(250.4)).toBe("£2.50");
            // A half penny below nought goes up, toward nought, as Math.round takes it.
            expect(mod.formatPence(-50.5)).toBe("-£0.50");
        });

        // ---------------------------------------------------------------------------- quiet hours
        pin("isQuiet: quiet over midnight starts at fromMin and ends just before toMin", () => {
            const q = { fromMin: 1260, toMin: 480 };
            expect([1259, 1260, 1439, 0, 479, 480, 720].map((m) => mod.isQuiet(q, m))).toEqual([
                false,
                true,
                true,
                true,
                true,
                false,
                false,
            ]);
        });
        pin("isQuiet: quiet within one day starts at fromMin and ends just before toMin", () => {
            const q = { fromMin: 780, toMin: 840 };
            expect([779, 780, 839, 840, 0, 1439].map((m) => mod.isQuiet(q, m))).toEqual([
                false,
                true,
                true,
                false,
                false,
                false,
            ]);
        });
        pin("isQuiet: the same time twice is no quiet hours at all", () => {
            expect([0, 599, 600, 601, 1439].map((m) => mod.isQuiet({ fromMin: 600, toMin: 600 }, m))).toEqual([
                false,
                false,
                false,
                false,
                false,
            ]);
            expect(mod.isQuiet({ fromMin: 0, toMin: 0 }, 0)).toBe(false);
        });
        pin("quietMinutes: the length of quiet in a day, over midnight or not", () => {
            expect(mod.quietMinutes({ fromMin: 1260, toMin: 480 })).toBe(660);
            expect(mod.quietMinutes({ fromMin: 780, toMin: 840 })).toBe(60);
            expect(mod.quietMinutes({ fromMin: 1, toMin: 0 })).toBe(1439);
        });
        pin("quietMinutes: 0 when the two times are the same", () => {
            expect(mod.quietMinutes({ fromMin: 600, toMin: 600 })).toBe(0);
            expect(mod.quietMinutes({ fromMin: 0, toMin: 0 })).toBe(0);
        });
        pin("clearOfQuiet: a stamp outside quiet hours is given back as it is", () => {
            const q = { fromMin: 1260, toMin: 480 };
            expect(mod.clearOfQuiet(q, at(5, 720))).toBe(at(5, 720));
            expect(mod.clearOfQuiet(q, at(5, 1259))).toBe(at(5, 1259));
            expect(mod.clearOfQuiet(q, at(6, 480))).toBe(at(6, 480));
        });
        pin("clearOfQuiet: an evening stamp moves to toMin of the next day", () => {
            const q = { fromMin: 1260, toMin: 480 };
            expect(mod.clearOfQuiet(q, at(5, 1260))).toBe(at(6, 480));
            expect(mod.clearOfQuiet(q, at(5, 1439))).toBe(at(6, 480));
        });
        pin("clearOfQuiet: a stamp in the small hours moves to toMin of the same day", () => {
            const q = { fromMin: 1260, toMin: 480 };
            expect(mod.clearOfQuiet(q, at(6, 0))).toBe(at(6, 480));
            expect(mod.clearOfQuiet(q, at(6, 479))).toBe(at(6, 480));
        });
        pin("clearOfQuiet: quiet within one day, and no quiet hours", () => {
            expect(mod.clearOfQuiet({ fromMin: 780, toMin: 840 }, at(5, 800))).toBe(at(5, 840));
            expect(mod.clearOfQuiet({ fromMin: 780, toMin: 840 }, at(5, 840))).toBe(at(5, 840));
            expect(mod.clearOfQuiet({ fromMin: 600, toMin: 600 }, at(5, 600))).toBe(at(5, 600));
            expect(mod.clearOfQuiet({ fromMin: 0, toMin: 0 }, at(5, 0))).toBe(at(5, 0));
        });
        pin("parseQuiet: two times with a dash between", () => {
            expect(mod.parseQuiet("21:00-08:00")).toEqual({ fromMin: 1260, toMin: 480 });
            expect(mod.parseQuiet(" 13.00 - 14.00 ")).toEqual({ fromMin: 780, toMin: 840 });
            expect(mod.parseQuiet("08:00-08:00")).toEqual({ fromMin: 480, toMin: 480 });
        });
        pin("parseQuiet: an empty text and none are no quiet hours, from 0 to 0", () => {
            expect(mod.parseQuiet("")).toEqual({ fromMin: 0, toMin: 0 });
            expect(mod.parseQuiet("  ")).toEqual({ fromMin: 0, toMin: 0 });
            expect(mod.parseQuiet("None")).toEqual({ fromMin: 0, toMin: 0 });
        });
        pin("parseQuiet: null for what cannot be read", () => {
            for (const text of ["21:00", "21:00-", "a-b", "21:00-08:00-09:00", "25:00-08:00", "21:00 to 08:00"]) {
                expect(mod.parseQuiet(text), text).toBeNull();
            }
        });

        // ------------------------------------------------------------------------------- reaching
        pin("mobileOf: a UK mobile comes back as +44 and ten digits, however it was typed", () => {
            for (const typed of [
                "07700 900123",
                "+44 7700 900123",
                "0044 7700 900123",
                "+44 (0)7700 900-123",
                "(07700) 900.123",
                "0044 (0)7700 900123",
                "0(0)7700 900123",
            ]) {
                expect(mod.mobileOf(typed), typed).toBe("+447700900123");
            }
        });
        pin("mobileOf: an empty text for anything that is not a UK mobile", () => {
            for (const typed of [
                "01632 960144",
                "7700900123",
                "",
                "0770090012",
                "077009001234",
                "+33 7 00 00 00 00",
                "07700 9OO123",
            ]) {
                expect(mod.mobileOf(typed), typed).toBe("");
            }
        });
        pin("reach: an email address is trimmed and put in lower case", () => {
            expect(mod.reach(booking(), "email")).toBe("priya@okafor.example");
            expect(mod.reach(booking({ email: "  P.Okafor@Mail.Okafor.Example " }), "email")).toBe(
                "p.okafor@mail.okafor.example",
            );
        });
        pin("reach: an empty text for an email address that cannot be one", () => {
            for (const email of [
                "",
                "priya",
                "priya@okafor",
                "a@@b.example",
                "a@b@c.example",
                "@b.example",
                "priya@.example",
                "priya@okafor.",
                "pri ya@okafor.example",
                "pri\tya@okafor.example",
                "priya@okafor\n.example",
            ]) {
                expect(mod.reach(booking({ email }), "email"), email).toBe("");
            }
        });
        pin("reach: a text goes to the mobile, and nowhere when the phone is not one", () => {
            expect(mod.reach(booking(), "sms")).toBe("+447700900123");
            expect(mod.reach(booking({ phone: "01632 960144" }), "sms")).toBe("");
            expect(mod.reach(booking({ phone: "" }), "sms")).toBe("");
        });
        pin("reach: a postal address loses blank lines and the spaces round each line", () => {
            expect(mod.reach(booking(), "post")).toBe("4 Mill Lane\nOtterby\nOT4 2QQ");
            expect(mod.reach(booking({ address: "  \n \n" }), "post")).toBe("");
            expect(mod.reach(booking({ address: "" }), "post")).toBe("");
        });
        pin("pickChannel: the first of the rule's channels the booking can be reached on", () => {
            const arrival = RULE_TABLE[2];
            expect(mod.pickChannel(arrival, booking())).toBe("sms");
            expect(mod.pickChannel(arrival, booking({ phone: "01632 960144" }))).toBe("email");
            expect(mod.pickChannel(RULE_TABLE[0], booking())).toBe("email");
            expect(mod.pickChannel(RULE_TABLE[0], booking({ email: "" }))).toBe("post");
            expect(mod.pickChannel({ ...arrival, channels: ["post", "sms", "email"] }, booking())).toBe("post");
        });
        pin("pickChannel: null when none of the rule's channels reaches the booking", () => {
            expect(mod.pickChannel(RULE_TABLE[2], booking({ phone: "", email: "" }))).toBeNull();
            expect(mod.pickChannel(RULE_TABLE[3], booking({ phone: "01632 960144" }))).toBeNull();
            expect(mod.pickChannel({ ...RULE_TABLE[0], channels: [] }, booking())).toBeNull();
        });

        // ---------------------------------------------------------------------------------- rules
        pin("ruleFor: the rule of a kind, the very one in RULES", () => {
            expect(mod.ruleFor("return")).toBe(mod.RULES[3]);
            expect(mod.ruleFor("confirmation")).toBe(mod.RULES[0]);
            expect(mod.ruleFor("deposit").offsetDays).toBe(7);
        });
        pin("ruleFor: throws for a kind that has no rule", () => {
            expect(() => mod.ruleFor("reminder" as unknown as "return")).toThrow("no rule for reminder");
            expect(() => mod.ruleFor("" as unknown as "return")).toThrow();
        });
        pin("whenDue: the anchor's day moved by the offset, at the rule's time of day", () => {
            expect(mod.RULES.map((r) => mod.whenDue(r, booking()))).toEqual([
                at(100, 0),
                at(145, 540),
                at(185, 600),
                at(193, 1050),
                at(195, 660),
                at(201, 540),
            ]);
            const own: Rule = { ...RULE_TABLE[3], kind: "thanks", offsetDays: -3, atMin: 5 };
            expect(mod.whenDue(own, booking())).toBe(at(191, 5));
        });
        pin("whenDue: NO_STAMP for the balance when nothing is left to pay", () => {
            expect(mod.whenDue(RULE_TABLE[1], booking({ balancePence: 0 }))).toBe(-1);
            expect(mod.whenDue(RULE_TABLE[1], booking({ balancePence: -500 }))).toBe(-1);
            expect(mod.whenDue(RULE_TABLE[1], booking({ balancePence: 1 }))).toBe(at(145, 540));
        });
        pin("whenDue: NO_STAMP for the deposit when none is held", () => {
            expect(mod.whenDue(RULE_TABLE[5], booking({ depositPence: 0 }))).toBe(-1);
            expect(mod.whenDue(RULE_TABLE[5], booking({ depositPence: -500 }))).toBe(-1);
            expect(mod.whenDue(RULE_TABLE[5], booking({ depositPence: 1 }))).toBe(at(201, 540));
            expect(mod.whenDue(RULE_TABLE[0], booking({ depositPence: 0, balancePence: 0 }))).toBe(at(100, 0));
        });
        pin("whenDue: takes no account of whether the booking can be reached", () => {
            expect(mod.whenDue(RULE_TABLE[3], booking({ phone: "", email: "", address: "" }))).toBe(at(193, 1050));
        });
        pin("timeline: what the booking will be sent, soonest first", () => {
            expect(mod.timeline(booking(), NOW)).toEqual([
                "Wed 10 Apr at 10.15am: confirmation by email",
                "Sat 25 May at 9am: balance by email",
                "Thu 4 Jul at 10am: arrival by sms",
                "Fri 12 Jul at 5.30pm: return by sms",
                "Sun 14 Jul at 11am: thanks by email",
                "Sat 20 Jul at 9am: deposit by email",
            ]);
        });
        pin("timeline: is in the order of the times, not of RULES", () => {
            // Entered ahead of the day it is booked for, so the confirmation falls after the balance notice.
            expect(mod.timeline(booking({ bookedDay: 150 }), NOW).slice(0, 3)).toEqual([
                "Sat 25 May at 9am: balance by email",
                "Thu 30 May at 8am: confirmation by email",
                "Thu 4 Jul at 10am: arrival by sms",
            ]);
        });
        pin("timeline: a kind that cannot reach the booking is left out", () => {
            expect(mod.timeline(booking({ phone: "01632 960144", email: "" }), NOW)).toEqual([
                "Wed 10 Apr at 10.15am: confirmation by post",
                "Sat 25 May at 9am: balance by post",
                "Sat 20 Jul at 9am: deposit by post",
            ]);
        });
        pin("timeline: what is already late goes now, in the order of RULES, or is skipped", () => {
            expect(mod.timeline(booking({ bookedDay: 194 }), at(194, 600))).toEqual([
                "Sat 13 Jul at 10am: confirmation by email",
                "Sat 13 Jul at 10am: balance by email",
                "Sat 13 Jul at 10am: arrival by sms",
                "Sun 14 Jul at 11am: thanks by email",
                "Sat 20 Jul at 9am: deposit by email",
            ]);
        });
        pin("timeline: a time in quiet hours waits for their end, by the default hours or the ones given", () => {
            expect(mod.timeline(booking(), at(100, 1300)).slice(0, 2)).toEqual([
                "Thu 11 Apr at 8am: confirmation by email",
                "Sat 25 May at 9am: balance by email",
            ]);
            expect(mod.timeline(booking(), at(100, 1300), { fromMin: 0, toMin: 0 })[0]).toBe(
                "Wed 10 Apr at 9.40pm: confirmation by email",
            );
            expect(mod.timeline(booking(), NOW, { fromMin: 500, toMin: 700 })).toEqual([
                "Wed 10 Apr at 11.40am: confirmation by email",
                "Sat 25 May at 11.40am: balance by email",
                "Thu 4 Jul at 11.40am: arrival by sms",
                "Fri 12 Jul at 5.30pm: return by sms",
                "Sun 14 Jul at 11.40am: thanks by email",
                "Sat 20 Jul at 11.40am: deposit by email",
            ]);
        });

        // ----------------------------------------------------------------------------------- text
        pin("nightsOf: the day the boat comes back is not a night", () => {
            expect(mod.nightsOf(booking())).toBe(7);
            expect(mod.nightsOf(booking({ startDay: 187, endDay: 188 }))).toBe(1);
        });
        pin("nightsOf: never less than 0", () => {
            expect(mod.nightsOf(booking({ startDay: 187, endDay: 187 }))).toBe(0);
            expect(mod.nightsOf(booking({ startDay: 187, endDay: 180 }))).toBe(0);
        });
        pin("greetingName: the first name as it was typed", () => {
            expect(mod.greetingName("Priya Okafor")).toBe("Priya");
            expect(mod.greetingName("  priya   okafor ")).toBe("priya");
            expect(mod.greetingName("Cher")).toBe("Cher");
        });
        pin("greetingName: a title is kept with the surname", () => {
            expect(mod.greetingName("Dr Okafor")).toBe("Dr Okafor");
            expect(mod.greetingName("Dr. Ada Okafor")).toBe("Dr. Okafor");
            expect(mod.greetingName("MRS Okafor")).toBe("MRS Okafor");
            expect(mod.greetingName("Missy Okafor")).toBe("Missy");
        });
        pin("greetingName: each title the yard knows", () => {
            expect(
                [
                    "Mr Okafor",
                    "Mrs Okafor",
                    "Ms Okafor",
                    "Miss Okafor",
                    "Mx Okafor",
                    "Dr Okafor",
                    "Prof Ada Okafor",
                    "Rev. Okafor",
                ].map((name) => mod.greetingName(name)),
            ).toEqual([
                "Mr Okafor",
                "Mrs Okafor",
                "Ms Okafor",
                "Miss Okafor",
                "Mx Okafor",
                "Dr Okafor",
                "Prof Okafor",
                "Rev. Okafor",
            ]);
        });
        pin("greetingName: customer when there is no name to use", () => {
            expect(mod.greetingName("")).toBe("customer");
            expect(mod.greetingName("   ")).toBe("customer");
            expect(mod.greetingName("Dr")).toBe("customer");
            expect(mod.greetingName("Rev.")).toBe("customer");
        });
        pin("fieldsOf: the twelve fields of a booking, as text", () => {
            expect(mod.fieldsOf(booking())).toEqual({
                ref: "LW-2041",
                name: "Priya",
                boat: "Kingfisher",
                start: "Sat 6 Jul",
                end: "Sat 13 Jul",
                nights: "7 nights",
                party: "4",
                balance: "£645",
                balanceBy: "Sat 8 Jun",
                deposit: "£150",
                handover: "2.30pm",
                back: "9.30am",
            });
        });
        pin("fieldsOf: one night is singular, and money keeps its pence", () => {
            const got = mod.fieldsOf(
                booking({ name: "Dr Okafor", startDay: 59, endDay: 60, balancePence: 123450, depositPence: 0 }),
            );
            expect(got.nights).toBe("1 night");
            expect(got.name).toBe("Dr Okafor");
            expect(got.start).toBe("Thu 29 Feb");
            expect(got.end).toBe("Fri 1 Mar");
            expect(got.balance).toBe("£1,234.50");
            expect(got.balanceBy).toBe("Thu 1 Feb");
            expect(got.deposit).toBe("£0");
            expect(mod.fieldsOf(booking({ endDay: 187 })).nights).toBe("0 nights");
        });

        pin("fill: puts each field's value where its name stands in braces", () => {
            expect(mod.fill("Dear {name}, {boat} is ready. {name}!", { name: "Priya", boat: "Kingfisher" })).toEqual({
                text: "Dear Priya, Kingfisher is ready. Priya!",
                missing: [],
            });
            expect(mod.fill("no fields here", { name: "Priya" })).toEqual({ text: "no fields here", missing: [] });
        });
        pin("fill: spaces round a name inside the braces do not count", () => {
            expect(mod.fill("{ name } and {boat  }", { name: "Priya", boat: "Kingfisher" })).toEqual({
                text: "Priya and Kingfisher",
                missing: [],
            });
        });
        pin("fill: a field with no value stays as written and is listed once, in the order met", () => {
            expect(mod.fill("{b} {a} { b } {c} {a}", { c: "x" })).toEqual({
                text: "{b} {a} { b } x {a}",
                missing: ["b", "a"],
            });
        });
        pin("fill: an empty string is a value", () => {
            expect(mod.fill("[{name}]", { name: "" })).toEqual({ text: "[]", missing: [] });
        });
        pin("fill: a doubled brace is one brace of the text", () => {
            expect(mod.fill("{{name}} {name} }}", { name: "x" })).toEqual({ text: "{name} x }", missing: [] });
            expect(mod.fill("a {{ b", {})).toEqual({ text: "a { b", missing: [] });
            // A field closes at its first closing brace, and the one after it is a brace alone.
            expect(mod.fill("{a}}", { a: "x" })).toEqual({ text: "x}", missing: [] });
        });
        pin("fill: a closing brace alone, and a brace never closed, are text", () => {
            expect(mod.fill("a } b", { a: "x" })).toEqual({ text: "a } b", missing: [] });
            expect(mod.fill("a {name", { name: "x" })).toEqual({ text: "a {name", missing: [] });
            expect(mod.fill("{name} and {boat", { name: "x", boat: "y" })).toEqual({
                text: "x and {boat",
                missing: [],
            });
        });
        pin("fill: only a field given counts, and a value is not filled again", () => {
            expect(mod.fill("{toString} {constructor}", {})).toEqual({
                text: "{toString} {constructor}",
                missing: ["toString", "constructor"],
            });
            expect(mod.fill("{a}", { a: "{b}", b: "x" })).toEqual({ text: "{b}", missing: [] });
        });
        pin("fill: empty braces are a field with an empty name", () => {
            expect(mod.fill("a {} b", { a: "x" })).toEqual({ text: "a {} b", missing: [""] });
            expect(mod.fill("a {} b", { "": "x" })).toEqual({ text: "a x b", missing: [] });
        });
        pin("fill: a bar inside the braces is part of the name", () => {
            expect(mod.fill("{boat|your boat}", { boat: "Kingfisher" })).toEqual({
                text: "{boat|your boat}",
                missing: ["boat|your boat"],
            });
        });

        pin("smsParts: one part up to 160 characters, and none for an empty text", () => {
            expect(mod.smsParts("")).toBe(0);
            expect(mod.smsParts("x")).toBe(1);
            expect(mod.smsParts("x".repeat(160))).toBe(1);
        });
        pin("smsParts: past 160 characters each part holds 153", () => {
            expect(mod.smsParts("x".repeat(161))).toBe(2);
            expect(mod.smsParts("x".repeat(306))).toBe(2);
            expect(mod.smsParts("x".repeat(307))).toBe(3);
            expect(mod.smsParts("x".repeat(459))).toBe(3);
            expect(mod.smsParts("x".repeat(460))).toBe(4);
        });
        pin("clipSms: a text that fits is given back as it is", () => {
            expect(mod.clipSms("x".repeat(160), 1)).toBe("x".repeat(160));
            expect(mod.clipSms("x".repeat(306), 2)).toBe("x".repeat(306));
            expect(mod.clipSms("x".repeat(459), 3)).toBe("x".repeat(459));
            expect(mod.clipSms("", 1)).toBe("");
        });
        pin("clipSms: a text too long is cut to fit with three dots at its end", () => {
            expect(mod.clipSms("x".repeat(161), 1)).toBe("x".repeat(157) + "...");
            expect(mod.clipSms("x".repeat(400), 2)).toBe("x".repeat(303) + "...");
            expect(mod.clipSms("x".repeat(500), 3)).toBe("x".repeat(456) + "...");
        });
        pin("clipSms: spaces before the dots are dropped, and fewer than one part is one part", () => {
            expect(mod.clipSms("x".repeat(150) + "       " + "y".repeat(20), 1)).toBe("x".repeat(150) + "...");
            expect(mod.clipSms("x".repeat(200), 0)).toBe("x".repeat(157) + "...");
        });
        pin("clipSms: spaces at the start of a text that is cut are kept", () => {
            expect(mod.clipSms("  " + "x".repeat(200), 1)).toBe("  " + "x".repeat(155) + "...");
        });

        pin("render: the subject and the body of an email, filled from the booking", () => {
            expect(mod.render("confirmation", "email", booking())).toEqual({
                subject: six()[0].subject,
                body: six()[0].body,
            });
            expect(mod.render("deposit", "post", booking({ name: "Dr Okafor", depositPence: 20050 }))).toEqual({
                subject: "Your deposit: booking LW-2041",
                body:
                    "Dear Dr Okafor,\n\nKingfisher has been checked over, and a cheque for your deposit of " +
                    "£200.50 is enclosed.\n\n" +
                    SIGN,
            });
        });
        pin("render: a text has an empty subject", () => {
            expect(mod.render("arrival", "sms", booking())).toEqual({ subject: "", body: six()[2].body });
            expect(mod.render("return", "sms", booking())).toEqual({ subject: "", body: six()[3].body });
        });
        pin("render: the other templates, each with the fields it uses", () => {
            expect(mod.render("confirmation", "post", booking())).toEqual({
                subject: "Your booking LW-2041",
                body:
                    "Dear Priya,\n\nWe confirm your booking of Kingfisher for 7 nights, from Sat 6 Jul to " +
                    "Sat 13 Jul, for a party of 4.\nYour reference is LW-2041.\n\n" +
                    SIGN,
            });
            expect(mod.render("balance", "post", booking())).toEqual({
                subject: "Balance due: booking LW-2041",
                body:
                    "Dear Priya,\n\nThe balance of £645 for your hire of Kingfisher from Sat 6 Jul is due by " +
                    "Sat 8 Jun.\nCheques should be made out to Lowmere Wharf Ltd, with LW-2041 on the back.\n\n" +
                    SIGN,
            });
            expect(mod.render("arrival", "email", booking())).toEqual({
                subject: "Kingfisher is nearly ready for you",
                body:
                    "Dear Priya,\n\nKingfisher will be ready from 2.30pm on Sat 6 Jul. Handover takes about " +
                    "an hour.\nThere is parking for one car for each boat. Bring your reference, LW-2041.\n\n" +
                    SIGN,
            });
        });
        pin("render: a text is cut to three parts, and an email is never cut", () => {
            const long = booking({ boat: "K".repeat(600) });
            const text = mod.render("arrival", "sms", long).body;
            expect(text.length).toBe(459);
            expect(text).toBe("Lowmere Wharf: " + "K".repeat(441) + "...");
            expect(mod.render("thanks", "email", long).body.length).toBe(six()[4].body.length - 10 + 600);
        });
        pin("render: throws when the kind has no template for the channel", () => {
            expect(() => mod.render("thanks", "sms", booking())).toThrow("no template for thanks by sms");
            expect(() => mod.render("return", "post", booking())).toThrow("no template for return by post");
        });
        pin("checkTemplates: finds no fault in the rules and templates as they are", () => {
            expect(mod.checkTemplates()).toEqual([]);
        });
        pin("checkTemplates: gives a new list each time", () => {
            const first = mod.checkTemplates();
            first.push("spoiled");
            expect(mod.checkTemplates()).toEqual([]);
        });
        pin("checkTemplates: names each channel of a rule that has no template, in the order of RULES", () => {
            // The table is changed for this case only, and put back as it was.
            const rules = mod.RULES as Rule[];
            const was = rules.map((r) => r.channels);
            try {
                rules[3].channels = ["post", "sms"];
                rules[4].channels = ["email", "sms"];
                expect(mod.checkTemplates()).toEqual(["return: no template for post", "thanks: no template for sms"]);
            } finally {
                rules.forEach((r, i) => {
                    r.channels = was[i];
                });
            }
            expect(mod.checkTemplates()).toEqual([]);
        });

        // ---------------------------------------------------------------------------- trying again
        pin("retryDelay: 15 minutes, an hour, four hours, a day, by the count of tries so far", () => {
            expect([1, 2, 3, 4].map((n) => mod.retryDelay(n, "email"))).toEqual([15, 60, 240, 1440]);
            expect([1, 2, 3, 4].map((n) => mod.retryDelay(n, "sms"))).toEqual([15, 60, 240, 1440]);
        });
        pin("retryDelay: GIVE_UP after the fifth try, and for a count below 1", () => {
            expect(mod.retryDelay(5, "email")).toBe(-1);
            expect(mod.retryDelay(9, "sms")).toBe(-1);
            expect(mod.retryDelay(0, "email")).toBe(-1);
            expect(mod.retryDelay(-1, "email")).toBe(-1);
            expect(mod.retryDelay(-1, "post")).toBe(-1);
        });
        pin("retryDelay: a letter is tried once more, a day later", () => {
            expect(mod.retryDelay(1, "post")).toBe(1440);
            expect(mod.retryDelay(2, "post")).toBe(-1);
            expect(mod.retryDelay(0, "post")).toBe(-1);
        });
        pin("isPermanent: the four codes, before a colon or alone, in any case", () => {
            for (const error of [
                "opted-out",
                "Opted-Out: STOP received",
                " unknown-number : not in service",
                "no-such-mailbox: 550",
                "bad-address",
            ]) {
                expect(mod.isPermanent(error), error).toBe(true);
            }
        });
        pin("isPermanent: false for any other failure", () => {
            for (const error of ["timeout", "550 no-such-mailbox", "", "opted-out-ish", "error: opted-out"]) {
                expect(mod.isPermanent(error), error).toBe(false);
            }
        });
        pin("tidyError: one line with single spaces, and unknown for an empty error", () => {
            expect(mod.tidyError("  gateway \n busy\t now ")).toBe("gateway busy now");
            expect(mod.tidyError("")).toBe("unknown");
            expect(mod.tidyError(" \n ")).toBe("unknown");
        });
        pin("tidyError: 80 characters are kept, and more are cut to 77 and three dots", () => {
            expect(mod.tidyError("e".repeat(80))).toBe("e".repeat(80));
            expect(mod.tidyError("e".repeat(81))).toBe("e".repeat(77) + "...");
            expect(mod.tidyError("e".repeat(300)).length).toBe(80);
            // A space that falls last in the 77 is kept before the dots.
            expect(mod.tidyError("e".repeat(76) + " " + "e".repeat(10))).toBe("e".repeat(76) + " ...");
        });

        // --------------------------------------------------------------------------------- sortDue
        pin("sortDue: soonest due first, and the lower id first where two are due together", () => {
            const list = [
                notice({ id: 4, dueAt: 500 }),
                notice({ id: 9, dueAt: 100 }),
                notice({ id: 2, dueAt: 500 }),
                notice({ id: 7, dueAt: 300 }),
                notice({ id: 3, dueAt: 500 }),
            ];
            expect(ids(mod.sortDue(list))).toEqual([9, 7, 2, 3, 4]);
        });
        pin("sortDue: sorts the list it was given and hands that same list back", () => {
            const list = [notice({ id: 2, dueAt: 900 }), notice({ id: 1, dueAt: 100 })];
            const got = mod.sortDue(list);
            expect(got).toBe(list);
            expect(ids(list)).toEqual([1, 2]);
            expect(mod.sortDue([])).toEqual([]);
        });

        // --------------------------------------------------------------------------- Outbox: plan
        pin("Outbox.size: 0 when new, then the count of notices in any state", () => {
            const box = new mod.Outbox();
            expect(box.size).toBe(0);
            box.plan(booking(), NOW);
            expect(box.size).toBe(6);
            box.cancel("LW-2041");
            box.sent(1, NOW);
            expect(box.size).toBe(6);
        });
        pin("Outbox.size: grows with each booking planned", () => {
            const box = planned();
            box.plan(booking({ ref: "LW-2042", phone: "", depositPence: 0 }), NOW);
            expect(box.size).toBe(10);
        });
        pin("Outbox: with no quiet hours given it keeps the default ones", () => {
            const box = new mod.Outbox();
            expect(box.plan(booking(), at(100, 1300))[0].dueAt).toBe(at(101, 480));
            expect(new mod.Outbox().plan(booking(), at(100, 1259))[0].dueAt).toBe(at(100, 1259));
        });
        pin("Outbox: keeps its own copy of the quiet hours it is given", () => {
            const q = { fromMin: 780, toMin: 840 };
            const box = new mod.Outbox(q);
            q.fromMin = 0;
            q.toMin = 0;
            expect(box.plan(booking(), at(100, 800))[0].dueAt).toBe(at(100, 840));
            expect(q).toEqual({ fromMin: 0, toMin: 0 });
        });
        pin("Outbox.plan: queues the six notices of a booking, numbered from 1", () => {
            const box = new mod.Outbox();
            expect(box.plan(booking(), NOW)).toEqual(six());
            expect(box.forBooking("LW-2041")).toEqual(six());
        });
        pin("Outbox.plan: hands back the outbox's own notices, so a later change shows on them", () => {
            const box = new mod.Outbox();
            const added = box.plan(booking(), NOW);
            expect(added[0]).toBe(box.get(1));
            expect(added[5]).toBe(box.get(6));
            box.sent(1, at(100, 620));
            expect(added[0].state).toBe("sent");
        });
        pin("Outbox.plan: numbers a booking's notices in the order of RULES, not of their due times", () => {
            // Entered ahead of the day it is booked for, so the confirmation is due after the balance notice.
            const added = new mod.Outbox().plan(booking({ bookedDay: 150 }), NOW);
            expect(added.map((n) => [n.id, n.kind, n.dueAt])).toEqual([
                [1, "confirmation", at(150, 480)],
                [2, "balance", at(145, 540)],
                [3, "arrival", at(185, 600)],
                [4, "return", at(193, 1050)],
                [5, "thanks", at(195, 660)],
                [6, "deposit", at(201, 540)],
            ]);
        });
        pin("Outbox.plan: does not change the booking, and numbers on across bookings", () => {
            const box = planned();
            const b = booking({ ref: "LW-2042", name: "Dr Tomas Brandt" });
            const before = copyOf(b);
            const added = box.plan(b, at(101, 600));
            expect(b).toEqual(before);
            expect(ids(added)).toEqual([7, 8, 9, 10, 11, 12]);
            expect(added.map((n) => n.ref)).toEqual(Array(6).fill("LW-2042"));
            expect(added[0].dueAt).toBe(at(101, 600));
            expect(added[0].body.startsWith("Dear Dr Brandt,\n")).toBe(true);
        });
        pin("Outbox.plan: a kind the booking already has is not queued twice", () => {
            const box = planned();
            expect(box.plan(booking(), at(101, 600))).toEqual([]);
            box.sent(1, NOW);
            box.failed(2, at(145, 540), "timeout");
            expect(box.plan(booking(), at(146, 600))).toEqual([]);
            expect(box.size).toBe(6);
        });
        pin("Outbox.plan: a kind that was dropped is queued again, under a new id", () => {
            const box = planned();
            box.sent(1, NOW);
            expect(box.cancel("LW-2041")).toBe(5);
            const again = box.plan(booking(), at(101, 600));
            expect(ids(again)).toEqual([7, 8, 9, 10, 11]);
            expect(again.map((n) => n.kind)).toEqual(["balance", "arrival", "return", "thanks", "deposit"]);
            expect(box.size).toBe(11);
        });
        pin("Outbox.plan: leaves out the balance when nothing is owed and the deposit when none is held", () => {
            const box = new mod.Outbox();
            const added = box.plan(booking({ balancePence: 0, depositPence: 0 }), NOW);
            expect(added.map((n) => n.kind)).toEqual(["confirmation", "arrival", "return", "thanks"]);
            expect(ids(added)).toEqual([1, 2, 3, 4]);
        });
        pin("Outbox.plan: each kind goes by the first channel that reaches the booking, or not at all", () => {
            const box = new mod.Outbox();
            const added = box.plan(booking({ phone: "01632 960144" }), NOW);
            expect(added.map((n) => `${n.kind} ${n.channel}`)).toEqual([
                "confirmation email",
                "balance email",
                "arrival email",
                "thanks email",
                "deposit email",
            ]);
            const byPost = new mod.Outbox().plan(booking({ email: "", phone: "" }), NOW);
            expect(byPost.map((n) => `${n.kind} ${n.channel}`)).toEqual([
                "confirmation post",
                "balance post",
                "deposit post",
            ]);
            expect(byPost[0].to).toBe("4 Mill Lane\nOtterby\nOT4 2QQ");
            expect(byPost[0].subject).toBe("Your booking LW-2041");
        });
        pin("Outbox.plan: a late notice goes now if its rule says send, and not at all if it says skip", () => {
            const box = new mod.Outbox();
            const now = at(194, 600);
            const added = box.plan(booking({ bookedDay: 194 }), now);
            expect(added.map((n) => [n.kind, n.dueAt])).toEqual([
                ["confirmation", now],
                ["balance", now],
                ["arrival", now],
                ["thanks", at(195, 660)],
                ["deposit", at(201, 540)],
            ]);
        });
        pin("Outbox.plan: a notice due exactly now is not late, and one in quiet hours waits for their end", () => {
            const onTime = new mod.Outbox().plan(booking(), at(193, 1050));
            expect(onTime.map((n) => n.kind)).toContain("return");
            const late = new mod.Outbox().plan(booking(), at(193, 1051));
            expect(late.map((n) => n.kind)).not.toContain("return");
            const night = new mod.Outbox().plan(booking(), at(100, 200));
            expect(night[0].dueAt).toBe(at(100, 480));
            const evening = new mod.Outbox({ fromMin: 500, toMin: 620 }).plan(booking(), NOW);
            expect(evening.map((n) => n.dueAt)).toEqual([
                at(100, 620),
                at(145, 620),
                at(185, 620),
                at(193, 1050),
                at(195, 660),
                at(201, 620),
            ]);
        });

        // --------------------------------------------------------------------------- Outbox: move
        pin("Outbox.move: works out again the time and the text of what is still queued", () => {
            const box = planned();
            box.sent(1, NOW);
            const later = booking({ startDay: 194, endDay: 201 });
            expect(box.move(later, at(101, 600))).toBe(5);
            expect(box.forBooking("LW-2041").map((n) => n.dueAt)).toEqual([
                NOW,
                at(152, 540),
                at(192, 600),
                at(200, 1050),
                at(202, 660),
                at(208, 540),
            ]);
            expect(box.get(1)).toEqual({ ...six()[0], state: "sent", tries: 1, sentAt: NOW });
            expect(box.get(2)?.body).toContain("from Sat 13 Jul is due by Sat 15 Jun.");
            expect(box.get(3)?.body).toContain("from 2.30pm on Sat 13 Jul.");
            expect(box.get(4)?.body).toContain("tomorrow, Sat 20 Jul,");
            expect(box.forBooking("LW-2041").map((n) => n.state)).toEqual([
                "sent",
                "queued",
                "queued",
                "queued",
                "queued",
                "queued",
            ]);
        });
        pin("Outbox.move: counts only the notices it changed", () => {
            const box = planned();
            box.sent(1, NOW);
            expect(box.move(booking(), at(101, 600))).toBe(0);
            expect(box.move(booking({ boat: "Moorhen" }), at(101, 600))).toBe(5);
            expect(box.move(booking({ boat: "Moorhen", party: 5 }), at(101, 600))).toBe(0);
            expect(box.move(booking({ boat: "Moorhen", name: "Asha Okafor" }), at(101, 600))).toBe(3);
            expect(box.get(5)?.body).toContain("Dear Asha,\n\nThank you for hiring Moorhen.");
            expect(box.move(booking({ ref: "LW-9999", boat: "Coot" }), at(101, 600))).toBe(0);
        });
        pin("Outbox.move: a queued notice that is late now goes now, and a failed one is left alone", () => {
            const box = planned();
            expect(box.failed(2, at(145, 540), "timeout")).toBe(at(145, 555));
            expect(box.move(booking({ startDay: 194, endDay: 201 }), at(146, 600))).toBe(5);
            expect(box.get(1)?.dueAt).toBe(at(146, 600));
            expect(box.get(2)).toEqual({ ...six()[1], state: "failed", tries: 1, dueAt: at(145, 555) });
            expect(box.get(3)?.dueAt).toBe(at(192, 600));
        });
        pin("Outbox.move: keeps a new due time clear of the outbox's own quiet hours, not the default ones", () => {
            const own = planned({ fromMin: 780, toMin: 840 });
            // The confirmation is now due at midnight, which only the default hours count as quiet.
            expect(own.move(booking({ bookedDay: 120 }), NOW)).toBe(1);
            expect(own.get(1)?.dueAt).toBe(at(120, 0));
            // Late, so it goes now, and now is in the outbox's own quiet hours.
            expect(own.move(booking({ bookedDay: 99 }), at(100, 800))).toBe(1);
            expect(own.get(1)?.dueAt).toBe(at(100, 840));
        });
        pin("Outbox.move: drops a queued notice whose rule no longer gives one", () => {
            const box = planned();
            box.sent(1, NOW);
            expect(box.move(booking({ balancePence: 0 }), at(101, 600))).toBe(1);
            expect(box.get(2)?.state).toBe("dropped");
            expect(box.get(2)?.dueAt).toBe(at(145, 540));
            // The boat is back already: the arrival text goes now, the reminder and the thanks are skipped.
            expect(box.move(booking({ balancePence: 0 }), at(196, 600))).toBe(3);
            expect(box.forBooking("LW-2041").map((n) => n.state)).toEqual([
                "sent",
                "dropped",
                "queued",
                "dropped",
                "dropped",
                "queued",
            ]);
            expect(box.get(3)?.dueAt).toBe(at(196, 600));
            expect(box.get(6)?.dueAt).toBe(at(201, 540));
        });
        pin("Outbox.move: a notice moves to another channel when the first no longer reaches", () => {
            const box = planned();
            box.sent(1, NOW);
            expect(box.move(booking({ phone: "" }), at(101, 600))).toBe(2);
            expect(box.get(3)).toEqual({
                ...six()[2],
                channel: "email",
                to: "priya@okafor.example",
                subject: "Kingfisher is nearly ready for you",
                body:
                    "Dear Priya,\n\nKingfisher will be ready from 2.30pm on Sat 6 Jul. Handover takes about " +
                    "an hour.\nThere is parking for one car for each boat. Bring your reference, LW-2041.\n\n" +
                    SIGN,
            });
            expect(box.get(4)?.state).toBe("dropped");
            expect(box.move(booking({ phone: "", email: "PRIYA@yard.example" }), at(101, 600))).toBe(4);
            expect(box.get(2)?.to).toBe("priya@yard.example");
        });

        // ------------------------------------------------------------------------- Outbox: cancel
        pin("Outbox.cancel: drops what is queued or failed and gives the count", () => {
            const box = planned();
            box.sent(1, NOW);
            box.failed(2, at(145, 540), "timeout");
            expect(box.cancel("LW-2041")).toBe(5);
            expect(box.forBooking("LW-2041").map((n) => n.state)).toEqual([
                "sent",
                "dropped",
                "dropped",
                "dropped",
                "dropped",
                "dropped",
            ]);
            expect(box.get(2)?.dueAt).toBe(at(145, 555));
            expect(box.get(2)?.tries).toBe(1);
            expect(box.cancel("LW-2041")).toBe(0);
        });
        pin("Outbox.cancel: touches no other booking, and gives 0 for a reference it does not know", () => {
            const box = planned();
            box.plan(booking({ ref: "LW-2042" }), NOW);
            expect(box.cancel("LW-204")).toBe(0);
            expect(box.cancel("LW-2042")).toBe(6);
            expect(box.counts()).toEqual({ queued: 6, sent: 0, failed: 0, dropped: 6 });
            expect(box.forBooking("LW-2041").every((n) => n.state === "queued")).toBe(true);
        });

        // ------------------------------------------------------------------ Outbox: get, forBooking
        pin("Outbox.get: the notice with that id, or undefined", () => {
            const box = planned();
            expect(box.get(3)).toEqual(six()[2]);
            expect(box.get(0)).toBeUndefined();
            expect(box.get(7)).toBeUndefined();
        });
        pin("Outbox.get: hands out the outbox's own notice, so a later change shows on it", () => {
            const box = planned();
            const held = box.get(1);
            box.sent(1, at(100, 620));
            expect(held?.state).toBe("sent");
            expect(held?.sentAt).toBe(at(100, 620));
            expect(box.get(1)).toBe(held);
        });
        pin("Outbox.forBooking: every notice of the booking, in the order they were queued", () => {
            const box = planned();
            box.plan(booking({ ref: "LW-2042", balancePence: 0 }), NOW);
            box.failed(1, NOW, "timeout");
            box.sent(3, at(185, 600));
            box.cancel("LW-2041");
            expect(ids(box.forBooking("LW-2041"))).toEqual([1, 2, 3, 4, 5, 6]);
            expect(ids(box.forBooking("LW-2042"))).toEqual([7, 8, 9, 10, 11]);
        });
        pin("Outbox.forBooking: an empty list for a reference it does not know", () => {
            const box = planned();
            expect(box.forBooking("LW-204")).toEqual([]);
            expect(box.forBooking("lw-2041")).toEqual([]);
            expect(new mod.Outbox().forBooking("LW-2041")).toEqual([]);
        });

        // ---------------------------------------------------------------------------- Outbox: due
        pin("Outbox.due: what is queued with a due time at or before now", () => {
            const box = planned();
            expect(ids(box.due(NOW - 1))).toEqual([]);
            expect(ids(box.due(NOW))).toEqual([1]);
            expect(ids(box.due(at(145, 539)))).toEqual([1]);
            expect(ids(box.due(at(145, 540)))).toEqual([1, 2]);
            expect(ids(box.due(at(201, 540)))).toEqual([1, 2, 3, 4, 5, 6]);
            expect(box.due(NOW)[0]).toBe(box.get(1));
        });
        pin("Outbox.due: soonest due first, then by id, whatever order they were queued in", () => {
            const box = new mod.Outbox();
            box.plan(booking({ ref: "LW-2050", bookedDay: 150, startDay: 250, endDay: 257 }), at(150, 600));
            box.plan(booking(), at(150, 600));
            // 1 to 6 are the later hire. 7, 8 and 1 are all due at once, then the rest by their times.
            expect(ids(box.due(at(300, 720)))).toEqual([1, 7, 8, 9, 10, 11, 12, 2, 3, 4, 5, 6]);
            expect(ids(box.forBooking("LW-2050"))).toEqual([1, 2, 3, 4, 5, 6]);
        });
        pin("Outbox.due: a failed notice comes back when its retry is due, and sent or dropped ones never", () => {
            const box = planned();
            box.plan(booking({ ref: "LW-2042" }), NOW);
            expect(box.failed(1, NOW, "timeout")).toBe(NOW + 15);
            box.sent(7, NOW);
            box.cancel("LW-2042");
            expect(ids(box.due(NOW))).toEqual([]);
            expect(ids(box.due(NOW + 14))).toEqual([]);
            expect(ids(box.due(NOW + 15))).toEqual([1]);
            expect(ids(box.due(at(201, 540)))).toEqual([1, 2, 3, 4, 5, 6]);
        });
        pin("Outbox.due: a limit keeps the first so many, and 0 or less is no limit", () => {
            const box = planned();
            const now = at(201, 540);
            expect(ids(box.due(now, 2))).toEqual([1, 2]);
            expect(ids(box.due(now, 6))).toEqual([1, 2, 3, 4, 5, 6]);
            expect(ids(box.due(now, 50))).toEqual([1, 2, 3, 4, 5, 6]);
            expect(ids(box.due(now, 0))).toEqual([1, 2, 3, 4, 5, 6]);
            expect(ids(box.due(now, -1))).toEqual([1, 2, 3, 4, 5, 6]);
        });
        pin("Outbox.due: changes nothing, and gives a new list each time", () => {
            const box = planned();
            const first = box.due(at(201, 540));
            first.reverse();
            first.pop();
            expect(ids(box.due(at(201, 540)))).toEqual([1, 2, 3, 4, 5, 6]);
            expect(box.forBooking("LW-2041")).toEqual(six());
        });
        pin("Outbox.due: hands out what is overdue whatever the time of day", () => {
            const box = planned();
            expect(ids(box.due(at(100, 1300)))).toEqual([1]);
            expect(ids(box.due(at(146, 0)))).toEqual([1, 2]);
            expect(ids(box.due(at(146, 479)))).toEqual([1, 2]);
        });

        // ----------------------------------------------------------------------- Outbox: nextWake
        pin("Outbox.nextWake: NO_STAMP when nothing waits", () => {
            const box = new mod.Outbox();
            expect(box.nextWake()).toBe(-1);
            box.plan(booking(), NOW);
            box.sent(1, NOW);
            box.cancel("LW-2041");
            expect(box.nextWake()).toBe(-1);
        });
        pin("Outbox.nextWake: the soonest due time of what is queued or failed", () => {
            const box = planned();
            expect(box.nextWake()).toBe(NOW);
            box.failed(1, at(100, 700), "timeout");
            expect(box.nextWake()).toBe(at(100, 715));
            box.sent(1, at(100, 715));
            expect(box.nextWake()).toBe(at(145, 540));
            box.plan(booking({ ref: "LW-2042" }), at(120, 900));
            expect(box.nextWake()).toBe(at(120, 900));
        });

        // --------------------------------------------------------------------------- Outbox: sent
        pin("Outbox.sent: marks the notice sent, counts the try and keeps the time", () => {
            const box = planned();
            expect(box.sent(1, at(100, 620))).toBe(true);
            expect(box.get(1)).toEqual({ ...six()[0], state: "sent", tries: 1, sentAt: at(100, 620) });
            expect(box.attemptsFor(1)).toEqual([{ noticeId: 1, at: at(100, 620), ok: true, error: "" }]);
            expect(box.get(2)).toEqual(six()[1]);
        });
        pin("Outbox.sent: a failed notice can still be sent, and the tries add up", () => {
            const box = planned();
            box.failed(1, NOW, "timeout");
            box.failed(1, NOW + 15, "timeout");
            expect(box.sent(1, NOW + 75)).toBe(true);
            expect(box.get(1)).toEqual({ ...six()[0], state: "sent", tries: 3, sentAt: NOW + 75, dueAt: NOW + 75 });
        });
        pin("Outbox.sent: false, with nothing recorded, for a notice sent, dropped or unknown", () => {
            const box = planned();
            box.sent(1, NOW);
            box.cancel("LW-2041");
            expect(box.sent(1, NOW + 5)).toBe(false);
            expect(box.sent(2, NOW + 5)).toBe(false);
            expect(box.sent(99, NOW + 5)).toBe(false);
            expect(box.get(1)?.sentAt).toBe(NOW);
            expect(box.get(1)?.tries).toBe(1);
            expect(box.get(2)?.tries).toBe(0);
            expect(box.attemptsFor(1).length).toBe(1);
            expect(box.attemptsFor(2)).toEqual([]);
        });

        // ------------------------------------------------------------------------- Outbox: failed
        pin("Outbox.failed: the first failure sets the next try 15 minutes on", () => {
            const box = planned();
            expect(box.failed(3, at(185, 600), "timeout")).toBe(at(185, 615));
            expect(box.get(3)).toEqual({ ...six()[2], state: "failed", tries: 1, dueAt: at(185, 615) });
            expect(box.attemptsFor(3)).toEqual([{ noticeId: 3, at: at(185, 600), ok: false, error: "timeout" }]);
        });
        pin("Outbox.failed: then an hour, four hours and a day, and the fifth failure gives up", () => {
            const box = planned();
            expect(box.failed(3, at(185, 600), "timeout")).toBe(at(185, 615));
            expect(box.failed(3, at(185, 615), "timeout")).toBe(at(185, 675));
            expect(box.failed(3, at(185, 675), "timeout")).toBe(at(185, 915));
            expect(box.failed(3, at(185, 915), "timeout")).toBe(at(186, 915));
            expect(box.get(3)?.state).toBe("failed");
            expect(box.failed(3, at(186, 915), "timeout")).toBe(-1);
            expect(box.get(3)).toEqual({ ...six()[2], state: "dropped", tries: 5, dueAt: at(186, 915) });
            expect(box.attemptsFor(3).length).toBe(5);
        });
        pin("Outbox.failed: the wait is counted from the failure, not from when the notice was due", () => {
            const box = planned();
            expect(box.failed(1, at(100, 900), "timeout")).toBe(at(100, 915));
            expect(box.failed(1, at(100, 1000), "timeout")).toBe(at(100, 1060));
        });
        pin("Outbox.failed: a next try that falls in quiet hours waits for their end", () => {
            const box = planned();
            expect(box.failed(3, at(185, 1250), "timeout")).toBe(at(186, 480));
            expect(box.get(3)?.dueAt).toBe(at(186, 480));
            expect(box.failed(4, at(193, 1244), "timeout")).toBe(at(193, 1259));
            const own = planned({ fromMin: 600, toMin: 660 });
            expect(own.failed(1, at(100, 660), "timeout")).toBe(at(100, 675));
            expect(own.failed(2, at(145, 590), "timeout")).toBe(at(145, 660));
        });
        pin("Outbox.failed: a failure no try can mend drops the notice at once", () => {
            const box = planned();
            expect(box.failed(4, at(193, 1100), "Opted-Out: STOP received")).toBe(-1);
            expect(box.get(4)).toEqual({ ...six()[3], state: "dropped", tries: 1 });
            expect(box.attemptsFor(4)).toEqual([
                { noticeId: 4, at: at(193, 1100), ok: false, error: "Opted-Out: STOP received" },
            ]);
        });
        pin("Outbox.failed: a letter gets one more try a day later, then is dropped", () => {
            const box = new mod.Outbox();
            box.plan(booking({ email: "", phone: "" }), NOW);
            expect(box.get(1)?.channel).toBe("post");
            expect(box.failed(1, NOW, "printer jam")).toBe(at(101, 615));
            expect(box.failed(1, at(101, 615), "printer jam")).toBe(-1);
            expect(box.get(1)?.state).toBe("dropped");
            expect(box.get(1)?.tries).toBe(2);
        });
        pin("Outbox.failed: NO_STAMP, with nothing recorded, for a notice sent, dropped or unknown", () => {
            const box = planned();
            box.sent(1, NOW);
            box.cancel("LW-2041");
            expect(box.failed(1, NOW + 5, "timeout")).toBe(-1);
            expect(box.failed(2, NOW + 5, "timeout")).toBe(-1);
            expect(box.failed(99, NOW + 5, "timeout")).toBe(-1);
            expect(box.get(1)?.state).toBe("sent");
            expect(box.get(2)).toEqual({ ...six()[1], state: "dropped" });
            expect(box.attemptsFor(2)).toEqual([]);
            expect(box.attemptsFor(99)).toEqual([]);
        });
        pin("Outbox.failed: the error is tidied before it is kept", () => {
            const box = planned();
            box.failed(1, NOW, "  gateway \n busy ");
            box.failed(2, at(145, 540), "");
            box.failed(3, at(185, 600), "e".repeat(100));
            expect(box.attemptsFor(1)[0].error).toBe("gateway busy");
            expect(box.attemptsFor(2)[0].error).toBe("unknown");
            expect(box.attemptsFor(3)[0].error).toBe("e".repeat(77) + "...");
        });

        // ------------------------------------------------------------------------ Outbox: requeue
        pin("Outbox.requeue: a dropped notice is queued for now, and keeps its count of tries", () => {
            const box = planned();
            box.failed(4, at(193, 1050), "opted-out");
            expect(box.requeue(4, at(193, 1100))).toBe(true);
            expect(box.get(4)).toEqual({ ...six()[3], state: "queued", tries: 1, dueAt: at(193, 1100) });
            expect(box.failed(4, at(193, 1100), "timeout")).toBe(at(193, 1160));
        });
        pin("Outbox.requeue: in quiet hours it is queued for their end", () => {
            const box = planned();
            box.cancel("LW-2041");
            expect(box.requeue(3, at(185, 1300))).toBe(true);
            expect(box.get(3)?.dueAt).toBe(at(186, 480));
            expect(box.requeue(5, at(186, 100))).toBe(true);
            expect(box.get(5)?.dueAt).toBe(at(186, 480));
        });
        pin("Outbox.requeue: goes by the outbox's own quiet hours, not the default ones", () => {
            const own = planned({ fromMin: 780, toMin: 840 });
            own.cancel("LW-2041");
            expect(own.requeue(3, at(185, 800))).toBe(true);
            expect(own.get(3)?.dueAt).toBe(at(185, 840));
            expect(own.requeue(5, at(185, 1300))).toBe(true);
            expect(own.get(5)?.dueAt).toBe(at(185, 1300));
        });
        pin("Outbox.requeue: false for a notice that is not dropped, or not known", () => {
            const box = planned();
            box.sent(1, NOW);
            box.failed(2, at(145, 540), "timeout");
            expect(box.requeue(1, at(146, 600))).toBe(false);
            expect(box.requeue(2, at(146, 600))).toBe(false);
            expect(box.requeue(3, at(146, 600))).toBe(false);
            expect(box.requeue(99, at(146, 600))).toBe(false);
            expect(box.get(2)?.dueAt).toBe(at(145, 555));
            expect(box.get(3)).toEqual(six()[2]);
        });
        pin("Outbox.requeue: false when another notice of the kind has taken its place", () => {
            const box = planned();
            box.cancel("LW-2041");
            box.plan(booking(), at(101, 600));
            expect(box.requeue(3, at(102, 600))).toBe(false);
            expect(box.get(3)?.state).toBe("dropped");
            box.cancel("LW-2041");
            expect(box.requeue(3, at(102, 600))).toBe(true);
            expect(box.requeue(9, at(102, 600))).toBe(false);
        });

        // ------------------------------------------------------------- Outbox: attempts and errors
        pin("Outbox.attemptsFor: the tries of one notice, the newest first", () => {
            const box = planned();
            box.failed(1, NOW, "timeout");
            box.failed(2, at(145, 540), "mailbox full");
            box.failed(1, NOW + 15, "gateway busy");
            box.sent(1, NOW + 75);
            expect(box.attemptsFor(1)).toEqual([
                { noticeId: 1, at: NOW + 75, ok: true, error: "" },
                { noticeId: 1, at: NOW + 15, ok: false, error: "gateway busy" },
                { noticeId: 1, at: NOW, ok: false, error: "timeout" },
            ]);
            expect(box.attemptsFor(2)).toEqual([{ noticeId: 2, at: at(145, 540), ok: false, error: "mailbox full" }]);
        });
        pin("Outbox.attemptsFor: an empty list for a notice never tried, and a new list each time", () => {
            const box = planned();
            expect(box.attemptsFor(1)).toEqual([]);
            expect(box.attemptsFor(99)).toEqual([]);
            box.failed(1, NOW, "timeout");
            box.attemptsFor(1).pop();
            expect(box.attemptsFor(1).length).toBe(1);
        });
        pin("Outbox.lastError: the error of the latest failed try", () => {
            const box = planned();
            box.failed(1, NOW, "timeout");
            expect(box.lastError(1)).toBe("timeout");
            box.failed(1, NOW + 15, "  gateway   busy ");
            expect(box.lastError(1)).toBe("gateway busy");
            box.sent(1, NOW + 75);
            expect(box.lastError(1)).toBe("gateway busy");
        });
        pin("Outbox.lastError: an empty text for a notice that has never failed", () => {
            const box = planned();
            box.failed(1, NOW, "timeout");
            box.sent(2, at(145, 540));
            expect(box.lastError(2)).toBe("");
            expect(box.lastError(3)).toBe("");
            expect(box.lastError(99)).toBe("");
        });
        pin("Outbox.problems: a line for each notice that has failed and not gone since, in id order", () => {
            const box = planned();
            box.failed(4, at(193, 1050), "opted-out: STOP");
            box.failed(3, at(185, 600), "timeout");
            expect(box.problems()).toEqual([
                "#3 LW-2041 arrival by sms: 1 try, next Thu 4 Jul at 10.15am, timeout",
                "#4 LW-2041 return by sms: 1 try, given up, opted-out: STOP",
            ]);
            box.failed(3, at(185, 615), "  gateway \n busy ");
            expect(box.problems()[0]).toBe(
                "#3 LW-2041 arrival by sms: 2 tries, next Thu 4 Jul at 11.15am, gateway busy",
            );
        });
        pin("Outbox.problems: nothing for what never failed, was cancelled untried, or went in the end", () => {
            const box = planned();
            expect(box.problems()).toEqual([]);
            box.failed(1, NOW, "timeout");
            box.sent(1, NOW + 15);
            box.failed(2, at(145, 540), "mailbox full");
            box.cancel("LW-2041");
            expect(box.problems()).toEqual(["#2 LW-2041 balance by email: 1 try, given up, mailbox full"]);
        });
        pin("Outbox.problems: a notice given up and queued again by hand is not listed until it fails again", () => {
            const box = planned();
            box.failed(4, at(193, 1050), "opted-out");
            expect(box.requeue(4, at(193, 1100))).toBe(true);
            expect(box.problems()).toEqual([]);
            box.failed(4, at(193, 1100), "timeout");
            expect(box.problems()).toEqual(["#4 LW-2041 return by sms: 2 tries, next Fri 12 Jul at 7.20pm, timeout"]);
        });
        pin("Outbox.counts: how many notices are in each state", () => {
            const box = planned();
            expect(box.counts()).toEqual({ queued: 6, sent: 0, failed: 0, dropped: 0 });
            box.sent(1, NOW);
            box.failed(2, at(145, 540), "timeout");
            box.failed(4, at(193, 1050), "opted-out");
            expect(box.counts()).toEqual({ queued: 3, sent: 1, failed: 1, dropped: 1 });
        });
        pin("Outbox.counts: all noughts for a new outbox", () => {
            expect(new mod.Outbox().counts()).toEqual({ queued: 0, sent: 0, failed: 0, dropped: 0 });
        });

        // -------------------------------------------------------------------------- Outbox: prune
        pin("Outbox.prune: forgets what was sent before the day, and keeps the day itself", () => {
            const box = planned();
            box.sent(1, at(144, 1439));
            box.sent(2, at(145, 0));
            expect(box.prune(145)).toBe(1);
            expect(ids(box.forBooking("LW-2041"))).toEqual([2, 3, 4, 5, 6]);
            expect(box.attemptsFor(1)).toEqual([]);
            expect(box.attemptsFor(2).length).toBe(1);
            expect(box.prune(146)).toBe(1);
            expect(box.size).toBe(4);
        });
        pin("Outbox.prune: goes by when a notice was sent, not by when it was due", () => {
            const box = planned();
            box.sent(1, at(150, 600));
            expect(box.prune(145)).toBe(0);
            expect(box.prune(150)).toBe(0);
            expect(box.get(1)?.state).toBe("sent");
            expect(box.prune(151)).toBe(1);
            expect(box.get(1)).toBeUndefined();
        });
        pin("Outbox.prune: forgets what was dropped with a due time before the day", () => {
            const box = planned();
            box.failed(3, at(185, 600), "opted-out");
            box.failed(4, at(193, 1050), "opted-out");
            expect(box.prune(185)).toBe(0);
            expect(box.prune(186)).toBe(1);
            expect(ids(box.forBooking("LW-2041"))).toEqual([1, 2, 4, 5, 6]);
            expect(box.attemptsFor(3)).toEqual([]);
            expect(box.attemptsFor(4).length).toBe(1);
        });
        pin("Outbox.prune: keeps what was dropped with a due time at the first minute of the day", () => {
            // With no quiet hours, the confirmation of a booking made on day 120 is due at its midnight.
            const box = new mod.Outbox({ fromMin: 0, toMin: 0 });
            box.plan(booking({ bookedDay: 120 }), NOW);
            box.cancel("LW-2041");
            expect(box.get(1)?.dueAt).toBe(at(120, 0));
            expect(box.prune(120)).toBe(0);
            expect(box.prune(121)).toBe(1);
            expect(box.get(1)).toBeUndefined();
        });
        pin("Outbox.prune: never forgets what is queued or failed, and numbering goes on", () => {
            const box = planned();
            box.failed(1, NOW, "timeout");
            expect(box.prune(1000)).toBe(0);
            expect(box.size).toBe(6);
            box.cancel("LW-2041");
            expect(box.prune(1000)).toBe(6);
            expect(box.size).toBe(0);
            expect(ids(box.plan(booking(), NOW))).toEqual([7, 8, 9, 10, 11, 12]);
        });

        // -------------------------------------------------------------------------------- reports
        pin("costPence: a text costs 4p a part, by the length of its body", () => {
            expect(mod.costPence(notice({ body: "x".repeat(160) }))).toBe(4);
            expect(mod.costPence(notice({ body: "x".repeat(161) }))).toBe(8);
            expect(mod.costPence(notice({ body: "x".repeat(307) }))).toBe(12);
            expect(mod.costPence(notice({ body: "" }))).toBe(0);
        });
        pin("costPence: a letter costs 87p and an email nothing", () => {
            expect(mod.costPence(notice({ channel: "post", body: "x".repeat(900) }))).toBe(87);
            expect(mod.costPence(notice({ channel: "email", body: "x".repeat(900) }))).toBe(0);
        });
        pin("spend: the cost of what was sent, and of nothing else", () => {
            const list = [
                notice({ id: 1, state: "sent", body: "x".repeat(200) }),
                notice({ id: 2, state: "sent", channel: "post" }),
                notice({ id: 3, state: "sent", channel: "email" }),
                notice({ id: 4, state: "failed", tries: 3 }),
                notice({ id: 5, state: "dropped", channel: "post", tries: 2 }),
                notice({ id: 6, state: "queued", channel: "post" }),
            ];
            expect(mod.spend(list)).toBe(95);
        });
        pin("spend: 0 for an empty list, and for a list with nothing sent", () => {
            expect(mod.spend([])).toBe(0);
            expect(mod.spend([notice({ channel: "post" }), notice({ state: "failed" })])).toBe(0);
        });
        pin("byDay: the notices by the day they fall due, the earliest day first", () => {
            const list = [
                notice({ id: 1, dueAt: at(12, 600) }),
                notice({ id: 2, dueAt: at(10, 1439) }),
                notice({ id: 3, dueAt: at(12, 0) }),
                notice({ id: 4, dueAt: at(11, 0) }),
                notice({ id: 5, dueAt: at(10, 30) }),
            ];
            const got = mod.byDay(list);
            expect(got).toBeInstanceOf(Map);
            expect([...got.keys()]).toEqual([10, 11, 12]);
            expect([...got.values()].map(ids)).toEqual([[2, 5], [4], [1, 3]]);
            expect(got.get(12)?.[0]).toBe(list[0]);
            // Days are put in order as numbers, not as text.
            const spread = [notice({ id: 1, dueAt: at(10, 0) }), notice({ id: 2, dueAt: at(9, 0) })];
            expect([...mod.byDay([...spread, notice({ id: 3, dueAt: at(100, 0) })]).keys()]).toEqual([9, 10, 100]);
        });
        pin("byDay: an empty map for an empty list, and the list is left as it was", () => {
            expect(mod.byDay([]).size).toBe(0);
            const list = [notice({ id: 2, dueAt: at(12, 600) }), notice({ id: 1, dueAt: at(10, 600) })];
            mod.byDay(list);
            expect(ids(list)).toEqual([2, 1]);
        });
        pin("describe: a waiting notice with its due time, its state and its tries", () => {
            expect(mod.describe(notice({ id: 3 }))).toBe(
                "#3 arrival by sms to +447700900123, due Thu 4 Jul at 10am (queued)",
            );
            expect(mod.describe(notice({ id: 3, state: "failed", tries: 1, dueAt: at(185, 615) }))).toBe(
                "#3 arrival by sms to +447700900123, due Thu 4 Jul at 10.15am (failed, tried once)",
            );
            expect(mod.describe(notice({ id: 3, state: "dropped", tries: 5, dueAt: at(186, 915) }))).toBe(
                "#3 arrival by sms to +447700900123, due Fri 5 Jul at 3.15pm (dropped, tried 5 times)",
            );
        });
        pin("describe: a sent notice with the time it went, and a letter by the first line of its address", () => {
            expect(mod.describe(notice({ id: 3, state: "sent", tries: 2, sentAt: at(185, 602) }))).toBe(
                "#3 arrival by sms to +447700900123, sent Thu 4 Jul at 10.02am",
            );
            const letter = notice({ id: 8, kind: "deposit", channel: "post", to: "4 Mill Lane\nOtterby\nOT4 2QQ" });
            expect(mod.describe({ ...letter, dueAt: at(201, 540) })).toBe(
                "#8 deposit by post to 4 Mill Lane, due Sat 20 Jul at 9am (queued)",
            );
        });
    });
}
