// Notices to customers of the yard: what is sent for a booking, when each one falls due,
// the quiet hours in which nothing goes out, and what happens when sending fails.
//
// A day is a day number: day 0 was Monday 1 January 2024. A time of day is minutes from midnight.
// A stamp is a day and a time of day in one number, day * DAY_MIN + minutes. Money is whole pence.

export type Channel = "email" | "sms" | "post";
export type NoticeKind = "confirmation" | "balance" | "arrival" | "return" | "thanks" | "deposit";
export type NoticeState = "queued" | "sent" | "failed" | "dropped";
export type Anchor = "booked" | "start" | "end";

export interface Booking {
    ref: string;
    name: string;
    boat: string;
    bookedDay: number;
    startDay: number;
    endDay: number;
    party: number;
    balancePence: number;
    depositPence: number;
    email: string;
    phone: string;
    address: string;
}

export interface QuietHours {
    fromMin: number;
    toMin: number;
}

export interface Rule {
    kind: NoticeKind;
    anchor: Anchor;
    offsetDays: number;
    atMin: number;
    channels: readonly Channel[];
    late: "send" | "skip";
}

export interface Template {
    subject: string;
    body: string;
}

export interface Filled {
    text: string;
    missing: string[];
}

export interface Notice {
    id: number;
    ref: string;
    kind: NoticeKind;
    channel: Channel;
    to: string;
    subject: string;
    body: string;
    dueAt: number;
    state: NoticeState;
    tries: number;
    sentAt: number;
}

export interface Attempt {
    noticeId: number;
    at: number;
    ok: boolean;
    error: string;
}

export interface DateParts {
    year: number;
    month: number;
    date: number;
    weekday: number;
}

interface Slot {
    due: number;
    channel: Channel;
}

export const DAY_MIN = 1440;
export const NO_STAMP = -1;
export const NO_MIN = -1;
export const GIVE_UP = -1;

export const SMS_SINGLE = 160;
export const SMS_MULTI = 153;
export const SMS_MAX_PARTS = 3;

export const HANDOVER_MIN = 870;
export const RETURN_BY_MIN = 570;
export const BALANCE_DAYS = 42;
// The balance notice goes out this many days before the money has to be in.
const BALANCE_GRACE_DAYS = 14;

export const DEFAULT_QUIET: QuietHours = { fromMin: 1260, toMin: 480 };

const EPOCH_YEAR = 2024;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TITLES = ["mr", "mrs", "ms", "miss", "mx", "dr", "prof", "rev"];

const RETRY_AFTER: readonly number[] = [15, 60, 240, DAY_MIN];
// A letter that did not print is tried once more, with the next day's post.
const POST_RETRY: readonly number[] = [DAY_MIN];
const PERMANENT = ["opted-out", "unknown-number", "no-such-mailbox", "bad-address"];
const ERROR_MAX = 80;

const SMS_PENCE = 4;
const POST_PENCE = 87;

// One rule for each kind, in the order the notices of a hire go out.
export const RULES: readonly Rule[] = [
    {
        kind: "confirmation",
        anchor: "booked",
        offsetDays: 0,
        atMin: 0,
        channels: ["email", "post"],
        late: "send",
    },
    {
        kind: "balance",
        anchor: "start",
        offsetDays: -BALANCE_DAYS,
        atMin: 540,
        channels: ["email", "post"],
        late: "send",
    },
    {
        kind: "arrival",
        anchor: "start",
        offsetDays: -2,
        atMin: 600,
        channels: ["sms", "email"],
        late: "send",
    },
    {
        kind: "return",
        anchor: "end",
        offsetDays: -1,
        atMin: 1050,
        channels: ["sms"],
        late: "skip",
    },
    {
        kind: "thanks",
        anchor: "end",
        offsetDays: 1,
        atMin: 660,
        channels: ["email"],
        late: "skip",
    },
    {
        kind: "deposit",
        anchor: "end",
        offsetDays: 7,
        atMin: 540,
        channels: ["email", "post"],
        late: "send",
    },
];

const SIGN_OFF = "Lowmere Wharf\n01632 960144";

const FIELD_NAMES = [
    "ref",
    "name",
    "boat",
    "start",
    "end",
    "nights",
    "party",
    "balance",
    "balanceBy",
    "deposit",
    "handover",
    "back",
];

const TEMPLATES: Record<NoticeKind, Partial<Record<Channel, Template>>> = {
    confirmation: {
        email: {
            subject: "Booking {ref} confirmed: {boat} from {start}",
            body: [
                "Dear {name},",
                "",
                "Thank you for booking {boat} for {nights}, {start} to {end}, for a party of {party}.",
                "Your reference is {ref}. Please quote it if you write or ring.",
                "",
                SIGN_OFF,
            ].join("\n"),
        },
        post: {
            subject: "Your booking {ref}",
            body: [
                "Dear {name},",
                "",
                "We confirm your booking of {boat} for {nights}, from {start} to {end}, for a party of {party}.",
                "Your reference is {ref}.",
                "",
                SIGN_OFF,
            ].join("\n"),
        },
    },
    balance: {
        email: {
            subject: "Balance due for {boat}, booking {ref}",
            body: [
                "Dear {name},",
                "",
                "The balance of {balance} for your hire of {boat} from {start} is due by {balanceBy}.",
                "You can pay by card on 01632 960144, quoting {ref}.",
                "",
                SIGN_OFF,
            ].join("\n"),
        },
        post: {
            subject: "Balance due: booking {ref}",
            body: [
                "Dear {name},",
                "",
                "The balance of {balance} for your hire of {boat} from {start} is due by {balanceBy}.",
                "Cheques should be made out to Lowmere Wharf Ltd, with {ref} on the back.",
                "",
                SIGN_OFF,
            ].join("\n"),
        },
    },
    arrival: {
        sms: {
            subject: "",
            body: "Lowmere Wharf: {boat} will be ready for you from {handover} on {start}. Ref {ref}. Bring this text.",
        },
        email: {
            subject: "{boat} is nearly ready for you",
            body: [
                "Dear {name},",
                "",
                "{boat} will be ready from {handover} on {start}. Handover takes about an hour.",
                "There is parking for one car for each boat. Bring your reference, {ref}.",
                "",
                SIGN_OFF,
            ].join("\n"),
        },
    },
    return: {
        sms: {
            subject: "",
            body: "Lowmere Wharf: please have {boat} back by {back} tomorrow, {end}, with the tanks pumped out.",
        },
    },
    thanks: {
        email: {
            subject: "Thank you from Lowmere Wharf",
            body: [
                "Dear {name},",
                "",
                "Thank you for hiring {boat}. We hope the {nights} went well, and that we see you again.",
                "",
                SIGN_OFF,
            ].join("\n"),
        },
    },
    deposit: {
        email: {
            subject: "Your deposit for booking {ref}",
            body: [
                "Dear {name},",
                "",
                "{boat} has been checked over, and your deposit of {deposit} is on its way back to your card.",
                "",
                SIGN_OFF,
            ].join("\n"),
        },
        post: {
            subject: "Your deposit: booking {ref}",
            body: [
                "Dear {name},",
                "",
                "{boat} has been checked over, and a cheque for your deposit of {deposit} is enclosed.",
                "",
                SIGN_OFF,
            ].join("\n"),
        },
    },
};

// ------------------------------------------------------------------------------------------ days and times

export function stampOf(day: number, min: number): number {
    return day * DAY_MIN + min;
}

export function dayOf(stamp: number): number {
    return Math.floor(stamp / DAY_MIN);
}

export function minOf(stamp: number): number {
    return stamp - dayOf(stamp) * DAY_MIN;
}

export function weekdayOf(day: number): number {
    return ((day % 7) + 7) % 7;
}

function isLeap(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function yearLength(year: number): number {
    return isLeap(year) ? 366 : 365;
}

function monthLength(year: number, month: number): number {
    return month === 1 && isLeap(year) ? 29 : MONTH_DAYS[month];
}

export function dateOf(day: number): DateParts {
    let year = EPOCH_YEAR;
    let left = Math.floor(day);
    while (left < 0) {
        year -= 1;
        left += yearLength(year);
    }
    while (left >= yearLength(year)) {
        left -= yearLength(year);
        year += 1;
    }
    let month = 0;
    while (left >= monthLength(year, month)) {
        left -= monthLength(year, month);
        month += 1;
    }
    return { year, month: month + 1, date: left + 1, weekday: weekdayOf(Math.floor(day)) };
}

export function formatDay(day: number, withYear = false): string {
    const parts = dateOf(day);
    const text = `${WEEKDAYS[parts.weekday]} ${parts.date} ${MONTHS[parts.month - 1]}`;
    return withYear ? `${text} ${parts.year}` : text;
}

// The way the yard writes a time: 9am, 2.30pm, noon.
export function formatMin(min: number): string {
    const m = ((Math.floor(min) % DAY_MIN) + DAY_MIN) % DAY_MIN;
    if (m === 0) {
        return "midnight";
    }
    if (m === 720) {
        return "noon";
    }
    const hour = Math.floor(m / 60);
    const past = m % 60;
    const half = hour < 12 ? "am" : "pm";
    const shown = hour % 12 === 0 ? 12 : hour % 12;
    return past === 0 ? `${shown}${half}` : `${shown}.${String(past).padStart(2, "0")}${half}`;
}

export function formatStamp(stamp: number): string {
    if (stamp === NO_STAMP) {
        return "not yet";
    }
    return `${formatDay(dayOf(stamp))} at ${formatMin(minOf(stamp))}`;
}

// Reads a time as the office types it into the settings: 21:00, 9.30, 07:05.
export function parseClock(text: string): number {
    const found = /^(\d{1,2})[:.](\d{2})$/.exec(text.trim());
    if (!found) {
        return NO_MIN;
    }
    const hour = Number(found[1]);
    const past = Number(found[2]);
    if (hour > 23 || past > 59) {
        return NO_MIN;
    }
    return hour * 60 + past;
}

export function formatPence(pence: number): string {
    const whole = Math.round(pence);
    const abs = Math.abs(whole);
    const pounds = String(Math.floor(abs / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const rest = abs % 100;
    // Whole pounds are written without the pence.
    const text = rest === 0 ? `£${pounds}` : `£${pounds}.${String(rest).padStart(2, "0")}`;
    return whole < 0 ? `-${text}` : text;
}

// --------------------------------------------------------------------------------------------- quiet hours

// `at` is a time of day, in minutes from midnight. It is not a stamp.
// Quiet runs from fromMin up to, but not including, toMin, and may run over midnight.
export function isQuiet(q: QuietHours, at: number): boolean {
    if (q.fromMin === q.toMin) {
        // The same time twice means no quiet hours, not a whole quiet day.
        return false;
    }
    if (q.fromMin < q.toMin) {
        return at >= q.fromMin && at < q.toMin;
    }
    return at >= q.fromMin || at < q.toMin;
}

export function quietMinutes(q: QuietHours): number {
    if (q.fromMin <= q.toMin) {
        return q.toMin - q.fromMin;
    }
    return DAY_MIN - q.fromMin + q.toMin;
}

// The stamp itself when it is outside quiet hours, else the first stamp after it that is.
export function clearOfQuiet(q: QuietHours, stamp: number): number {
    const min = minOf(stamp);
    if (!isQuiet(q, min)) {
        return stamp;
    }
    const day = dayOf(stamp);
    return stampOf(min < q.toMin ? day : day + 1, q.toMin);
}

// "21:00-08:00". An empty text, or "none", is no quiet hours. null when it cannot be read.
export function parseQuiet(text: string): QuietHours | null {
    const tidy = text.trim().toLowerCase();
    if (tidy === "" || tidy === "none") {
        return { fromMin: 0, toMin: 0 };
    }
    const ends = tidy.split("-");
    if (ends.length !== 2) {
        return null;
    }
    const fromMin = parseClock(ends[0]);
    const toMin = parseClock(ends[1]);
    if (fromMin === NO_MIN || toMin === NO_MIN) {
        return null;
    }
    return { fromMin, toMin };
}

// ------------------------------------------------------------------------------------- reaching a customer

// The number as +44..., or "" when it is not a UK mobile: only a mobile can take a text.
export function mobileOf(phone: string): string {
    const typed = phone.replace(/[\s().-]/g, "");
    let rest: string;
    if (typed.startsWith("+44")) {
        rest = typed.slice(3);
    } else if (typed.startsWith("0044")) {
        rest = typed.slice(4);
    } else if (typed.startsWith("0")) {
        rest = typed.slice(1);
    } else {
        return "";
    }
    if (rest.startsWith("0")) {
        // +44 (0)7700 ... is common on letterheads.
        rest = rest.slice(1);
    }
    return /^7\d{9}$/.test(rest) ? `+44${rest}` : "";
}

function looksLikeEmail(text: string): boolean {
    const at = text.indexOf("@");
    if (at <= 0 || at !== text.lastIndexOf("@")) {
        return false;
    }
    const host = text.slice(at + 1);
    return host.includes(".") && !host.startsWith(".") && !host.endsWith(".") && !/\s/.test(text);
}

// Where a notice on this channel would go, or "" when the booking cannot be reached on it.
export function reach(b: Booking, channel: Channel): string {
    if (channel === "email") {
        const email = b.email.trim();
        return looksLikeEmail(email) ? email.toLowerCase() : "";
    }
    if (channel === "sms") {
        return mobileOf(b.phone);
    }
    return b.address
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== "")
        .join("\n");
}

export function pickChannel(rule: Rule, b: Booking): Channel | null {
    for (const channel of rule.channels) {
        if (reach(b, channel) !== "") {
            return channel;
        }
    }
    return null;
}

// ------------------------------------------------------------------------------------- when a notice is due

export function ruleFor(kind: NoticeKind): Rule {
    const rule = RULES.find((r) => r.kind === kind);
    if (!rule) {
        throw new Error(`no rule for ${kind}`);
    }
    return rule;
}

function anchorDay(b: Booking, anchor: Anchor): number {
    if (anchor === "booked") {
        return b.bookedDay;
    }
    return anchor === "start" ? b.startDay : b.endDay;
}

// NO_STAMP when the rule is not for this booking: nothing left to pay, or no deposit held.
export function whenDue(rule: Rule, b: Booking): number {
    if (rule.kind === "balance" && b.balancePence <= 0) {
        return NO_STAMP;
    }
    if (rule.kind === "deposit" && b.depositPence <= 0) {
        return NO_STAMP;
    }
    return stampOf(anchorDay(b, rule.anchor) + rule.offsetDays, rule.atMin);
}

// Where and when a rule's notice goes for a booking that is planned at `now`, or null when it does not go.
function slotFor(rule: Rule, b: Booking, now: number, quiet: QuietHours): Slot | null {
    let due = whenDue(rule, b);
    const channel = pickChannel(rule, b);
    if (due === NO_STAMP || channel === null) {
        return null;
    }
    if (due < now) {
        if (rule.late === "skip") {
            return null;
        }
        due = now;
    }
    return { due: clearOfQuiet(quiet, due), channel };
}

// What a customer will be sent and when, for the office to read out. Soonest first.
export function timeline(b: Booking, now: number, quiet: QuietHours = DEFAULT_QUIET): string[] {
    const slots: { due: number; line: string }[] = [];
    for (const rule of RULES) {
        const slot = slotFor(rule, b, now, quiet);
        if (slot) {
            slots.push({ due: slot.due, line: `${formatStamp(slot.due)}: ${rule.kind} by ${slot.channel}` });
        }
    }
    // The sort is stable, so two notices due together stay in the order of RULES.
    slots.sort((a, c) => a.due - c.due);
    return slots.map((s) => s.line);
}

// ------------------------------------------------------------------------------------------------ the text

export function nightsOf(b: Booking): number {
    // endDay is the day the boat comes back, so it is not a night of the hire.
    return Math.max(0, b.endDay - b.startDay);
}

export function greetingName(name: string): string {
    const words = name
        .trim()
        .split(/\s+/)
        .filter((w) => w !== "");
    if (words.length === 0) {
        return "customer";
    }
    const first = words[0].replace(/\.$/, "").toLowerCase();
    if (TITLES.includes(first)) {
        // "Dr Okafor" is greeted by title and surname, "Priya Okafor" by first name.
        return words.length > 1 ? `${words[0]} ${words[words.length - 1]}` : "customer";
    }
    return words[0];
}

export function fieldsOf(b: Booking): Record<string, string> {
    const nights = nightsOf(b);
    return {
        ref: b.ref,
        name: greetingName(b.name),
        boat: b.boat,
        start: formatDay(b.startDay),
        end: formatDay(b.endDay),
        nights: nights === 1 ? "1 night" : `${nights} nights`,
        party: String(b.party),
        balance: formatPence(b.balancePence),
        balanceBy: formatDay(b.startDay - BALANCE_DAYS + BALANCE_GRACE_DAYS),
        deposit: formatPence(b.depositPence),
        handover: formatMin(HANDOVER_MIN),
        back: formatMin(RETURN_BY_MIN),
    };
}

// A field is written {name}. A doubled brace, {{ or }}, is one brace of the text.
export function fill(template: string, fields: Record<string, string>): Filled {
    const missing: string[] = [];
    let text = "";
    let at = 0;
    while (at < template.length) {
        const ch = template[at];
        if ((ch === "{" || ch === "}") && template[at + 1] === ch) {
            text += ch;
            at += 2;
            continue;
        }
        if (ch !== "{") {
            text += ch;
            at += 1;
            continue;
        }
        const close = template.indexOf("}", at);
        if (close < 0) {
            // A brace that is never closed is text.
            text += template.slice(at);
            break;
        }
        const name = template.slice(at + 1, close).trim();
        if (Object.hasOwn(fields, name)) {
            text += fields[name];
        } else {
            // A field with no value stays in the text as it was written, so that it shows in a proof.
            if (!missing.includes(name)) {
                missing.push(name);
            }
            text += template.slice(at, close + 1);
        }
        at = close + 1;
    }
    return { text, missing };
}

export function smsParts(text: string): number {
    if (text.length === 0) {
        return 0;
    }
    // A text that needs more than one part loses seven characters of each part to the joining header.
    return text.length <= SMS_SINGLE ? 1 : Math.ceil(text.length / SMS_MULTI);
}

// Cuts a text so that it fits in `parts` parts. A text that is cut ends with three dots.
export function clipSms(text: string, parts: number): string {
    const room = parts <= 1 ? SMS_SINGLE : parts * SMS_MULTI;
    if (text.length <= room) {
        return text;
    }
    return `${text.slice(0, room - 3).trimEnd()}...`;
}

export function render(kind: NoticeKind, channel: Channel, b: Booking): Template {
    const template = TEMPLATES[kind][channel];
    if (!template) {
        throw new Error(`no template for ${kind} by ${channel}`);
    }
    const fields = fieldsOf(b);
    const subject = fill(template.subject, fields);
    const body = fill(template.body, fields);
    const missing = [...subject.missing, ...body.missing];
    if (missing.length > 0) {
        throw new Error(`the ${kind} template for ${channel} has no value for: ${missing.join(", ")}`);
    }
    return { subject: subject.text, body: channel === "sms" ? clipSms(body.text, SMS_MAX_PARTS) : body.text };
}

// What is wrong with the rules and the templates, one line for each fault. Run when the app starts.
export function checkTemplates(): string[] {
    const faults: string[] = [];
    const blank: Record<string, string> = {};
    for (const name of FIELD_NAMES) {
        blank[name] = "";
    }
    for (const rule of RULES) {
        for (const channel of rule.channels) {
            const template = TEMPLATES[rule.kind][channel];
            if (!template) {
                faults.push(`${rule.kind}: no template for ${channel}`);
                continue;
            }
            const unknown = [...fill(template.subject, blank).missing, ...fill(template.body, blank).missing];
            for (const name of unknown) {
                faults.push(`${rule.kind} by ${channel}: unknown field ${name}`);
            }
            if (channel === "sms" && template.subject !== "") {
                faults.push(`${rule.kind} by sms: a text has no subject`);
            }
            if (channel !== "sms" && template.subject === "") {
                faults.push(`${rule.kind} by ${channel}: the subject is empty`);
            }
        }
    }
    return faults;
}

// ------------------------------------------------------------------------------------------- trying again

// How long to wait after the failure that made it `tries` tries, or GIVE_UP when there is no next try.
export function retryDelay(tries: number, channel: Channel): number {
    const ladder = channel === "post" ? POST_RETRY : RETRY_AFTER;
    if (tries < 1 || tries > ladder.length) {
        return GIVE_UP;
    }
    return ladder[tries - 1];
}

// A failure that no further try can mend. The sender reports these as a code, then a colon, then detail.
export function isPermanent(error: string): boolean {
    const code = error.split(":")[0].trim().toLowerCase();
    return PERMANENT.includes(code);
}

export function tidyError(error: string): string {
    const flat = error.replace(/\s+/g, " ").trim();
    if (flat === "") {
        return "unknown";
    }
    return flat.length <= ERROR_MAX ? flat : `${flat.slice(0, ERROR_MAX - 3)}...`;
}

// --------------------------------------------------------------------------------------------- the outbox

function isWaiting(state: NoticeState): boolean {
    return state === "queued" || state === "failed";
}

// Sorts the list it is given, soonest due first and then by id, and hands the same list back.
export function sortDue(list: Notice[]): Notice[] {
    return list.sort((a, b) => a.dueAt - b.dueAt || a.id - b.id);
}

export class Outbox {
    private notices: Notice[] = [];
    // Newest first.
    private log: Attempt[] = [];
    private nextId = 1;
    private readonly quiet: QuietHours;

    constructor(quiet: QuietHours = DEFAULT_QUIET) {
        this.quiet = { fromMin: quiet.fromMin, toMin: quiet.toMin };
    }

    get size(): number {
        return this.notices.length;
    }

    // Queues what the rules give for a booking and hands back what was added. A kind that the booking
    // already has in the outbox is not queued twice, unless the earlier one was dropped.
    plan(b: Booking, now: number): Notice[] {
        const added: Notice[] = [];
        for (const rule of RULES) {
            const slot = slotFor(rule, b, now, this.quiet);
            if (!slot) {
                continue;
            }
            if (this.notices.some((n) => n.ref === b.ref && n.kind === rule.kind && n.state !== "dropped")) {
                continue;
            }
            const text = render(rule.kind, slot.channel, b);
            const notice: Notice = {
                id: this.nextId,
                ref: b.ref,
                kind: rule.kind,
                channel: slot.channel,
                to: reach(b, slot.channel),
                subject: text.subject,
                body: text.body,
                dueAt: slot.due,
                state: "queued",
                tries: 0,
                sentAt: NO_STAMP,
            };
            this.nextId += 1;
            this.notices.push(notice);
            added.push(notice);
        }
        return added;
    }

    // The dates or the details of a booking changed. Only what is still queued is worked out again:
    // a notice that has failed keeps its retry time and its text. Gives the number of notices changed.
    move(b: Booking, now: number): number {
        let changed = 0;
        for (const n of this.notices) {
            if (n.ref !== b.ref || n.state !== "queued") {
                continue;
            }
            const slot = slotFor(ruleFor(n.kind), b, now, this.quiet);
            if (!slot) {
                n.state = "dropped";
                changed += 1;
                continue;
            }
            const text = render(n.kind, slot.channel, b);
            const to = reach(b, slot.channel);
            const same =
                n.dueAt === slot.due &&
                n.channel === slot.channel &&
                n.to === to &&
                n.subject === text.subject &&
                n.body === text.body;
            if (same) {
                continue;
            }
            n.dueAt = slot.due;
            n.channel = slot.channel;
            n.to = to;
            n.subject = text.subject;
            n.body = text.body;
            changed += 1;
        }
        return changed;
    }

    // Drops whatever has not gone yet for a booking. What was sent stays as it is.
    cancel(ref: string): number {
        let dropped = 0;
        for (const n of this.notices) {
            if (n.ref === ref && isWaiting(n.state)) {
                n.state = "dropped";
                dropped += 1;
            }
        }
        return dropped;
    }

    get(id: number): Notice | undefined {
        return this.notices.find((n) => n.id === id);
    }

    forBooking(ref: string): Notice[] {
        return this.notices.filter((n) => n.ref === ref);
    }

    // What a booking is still waiting to be sent: queued or failed notices, soonest due first,
    // and by id where the due times are the same. Gives a new array and leaves the outbox as it was.
    waitingFor(ref: string): Notice[] {
        const waiting = this.notices.filter((n) => n.ref === ref && (n.state === "queued" || n.state === "failed"));
        return waiting.sort((a, b) => a.dueAt - b.dueAt || a.id - b.id);
    }

    // What the sender should send at `now`, in the order to send it. A limit of 0 is no limit.
    due(now: number, limit = 0): Notice[] {
        const ready = this.notices.filter((n) => isWaiting(n.state) && n.dueAt <= now);
        sortDue(ready);
        return limit > 0 ? ready.slice(0, limit) : ready;
    }

    // The stamp at which the sender next has something to do, or NO_STAMP when nothing waits.
    nextWake(): number {
        let soonest = NO_STAMP;
        for (const n of this.notices) {
            if (isWaiting(n.state) && (soonest === NO_STAMP || n.dueAt < soonest)) {
                soonest = n.dueAt;
            }
        }
        return soonest;
    }

    sent(id: number, now: number): boolean {
        const n = this.get(id);
        if (!n || !isWaiting(n.state)) {
            return false;
        }
        n.state = "sent";
        n.tries += 1;
        n.sentAt = now;
        this.log.unshift({ noticeId: id, at: now, ok: true, error: "" });
        return true;
    }

    // Records a failed try. Gives the stamp of the next try, or NO_STAMP when there will be none.
    failed(id: number, now: number, error: string): number {
        const n = this.get(id);
        if (!n || !isWaiting(n.state)) {
            return NO_STAMP;
        }
        n.tries += 1;
        this.log.unshift({ noticeId: id, at: now, ok: false, error: tidyError(error) });
        const wait = isPermanent(error) ? GIVE_UP : retryDelay(n.tries, n.channel);
        if (wait === GIVE_UP) {
            n.state = "dropped";
            return NO_STAMP;
        }
        n.state = "failed";
        n.dueAt = clearOfQuiet(this.quiet, now + wait);
        return n.dueAt;
    }

    // The office sends again by hand something that was given up on. The count of tries is kept.
    requeue(id: number, now: number): boolean {
        const n = this.get(id);
        if (!n || n.state !== "dropped") {
            return false;
        }
        if (this.notices.some((o) => o.id !== id && o.ref === n.ref && o.kind === n.kind && o.state !== "dropped")) {
            // Another notice of the kind took its place when the booking was planned again.
            return false;
        }
        n.state = "queued";
        n.dueAt = clearOfQuiet(this.quiet, now);
        return true;
    }

    attemptsFor(id: number): Attempt[] {
        return this.log.filter((a) => a.noticeId === id);
    }

    // The error of the latest failed try, or "" when the notice has never failed.
    lastError(id: number): string {
        const last = this.log.find((a) => a.noticeId === id && !a.ok);
        return last ? last.error : "";
    }

    // One line for each notice that has failed at least once and has not gone since, in id order.
    problems(): string[] {
        const lines: string[] = [];
        for (const n of this.notices) {
            if (n.tries === 0 || (n.state !== "failed" && n.state !== "dropped")) {
                continue;
            }
            const tries = n.tries === 1 ? "1 try" : `${n.tries} tries`;
            const next = n.state === "failed" ? `next ${formatStamp(n.dueAt)}` : "given up";
            lines.push(`#${n.id} ${n.ref} ${n.kind} by ${n.channel}: ${tries}, ${next}, ${this.lastError(n.id)}`);
        }
        return lines;
    }

    counts(): Record<NoticeState, number> {
        const out: Record<NoticeState, number> = { queued: 0, sent: 0, failed: 0, dropped: 0 };
        for (const n of this.notices) {
            out[n.state] += 1;
        }
        return out;
    }

    // Forgets what was finished before a day: sent before it, or dropped with a due time before it.
    // The day itself is kept. Gives the number of notices forgotten.
    prune(beforeDay: number): number {
        const cut = stampOf(beforeDay, 0);
        const gone = new Set<number>();
        for (const n of this.notices) {
            if (n.state === "sent" && n.sentAt < cut) {
                gone.add(n.id);
            } else if (n.state === "dropped" && n.dueAt < cut) {
                gone.add(n.id);
            }
        }
        if (gone.size > 0) {
            this.notices = this.notices.filter((n) => !gone.has(n.id));
            this.log = this.log.filter((a) => !gone.has(a.noticeId));
        }
        return gone.size;
    }
}

// ------------------------------------------------------------------------------------------------ reports

export function costPence(n: Notice): number {
    if (n.channel === "sms") {
        return smsParts(n.body) * SMS_PENCE;
    }
    return n.channel === "post" ? POST_PENCE : 0;
}

// What the notices in the list cost to send. Only what was sent is counted: a failed try is not charged.
export function spend(list: Notice[]): number {
    let pence = 0;
    for (const n of list) {
        if (n.state === "sent") {
            pence += costPence(n);
        }
    }
    return pence;
}

// The notices by the day they fall due, the earliest day first. Within a day they keep the order given.
export function byDay(list: Notice[]): Map<number, Notice[]> {
    const days = new Map<number, Notice[]>();
    for (const day of [...new Set(list.map((n) => dayOf(n.dueAt)))].sort((a, b) => a - b)) {
        days.set(day, []);
    }
    for (const n of list) {
        days.get(dayOf(n.dueAt))?.push(n);
    }
    return days;
}

export function describe(n: Notice): string {
    const head = `#${n.id} ${n.kind} by ${n.channel} to ${n.to.split("\n")[0]}`;
    if (n.state === "sent") {
        return `${head}, sent ${formatStamp(n.sentAt)}`;
    }
    const tries = n.tries > 0 ? `, tried ${n.tries === 1 ? "once" : `${n.tries} times`}` : "";
    return `${head}, due ${formatStamp(n.dueAt)} (${n.state}${tries})`;
}
