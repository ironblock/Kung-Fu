I'm working on a small app in /home/dev/11d2c8/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# List what a booking is still waiting for

When a customer rings to ask what we still have to send them, the office has to work it out by hand. Please add a method to the `Outbox` class in `src/notices.ts`:

```ts
waitingFor(ref: string): Notice[]
```

It gives the notices of the booking with that reference that have not gone yet: those whose `state` is `queued` or `failed`. Leave out the ones that are `sent` or `dropped`, and the notices of every other booking.

Order them by `dueAt`, soonest first. Where two have the same `dueAt`, the one with the lower `id` comes first.

A reference the outbox holds nothing for gives an empty array.

The method must not change the outbox: no notice is altered, and the order in which the outbox itself keeps its notices stays as it was. Each call gives a new array.

Please keep every change inside /home/dev/11d2c8/app.

You cannot open files or run anything from where you are. Here is what you have of app/src/notices.ts.

Its outline, as `ast-grep outline --view expanded --items all` prints it. Each line is a line number and the first line of a declaration or of one of its members. The rest of the file is not shown.

```
src/notices.ts
  7: export type Channel = "email" | "sms" | "post";
  8: export type NoticeKind = "confirmation" | "balance" | "arrival" | "return" | "thanks" | "deposit";
  9: export type NoticeState = "queued" | "sent" | "failed" | "dropped";
 10: export type Anchor = "booked" | "start" | "end";
 12: export interface Booking {
 13:   ref: string
 14:   name: string
 15:   boat: string
 16:   bookedDay: number
 17:   startDay: number
 18:   endDay: number
 19:   party: number
 20:   balancePence: number
 21:   depositPence: number
 22:   email: string
 23:   phone: string
 24:   address: string
 27: export interface QuietHours {
 28:   fromMin: number
 29:   toMin: number
 32: export interface Rule {
 33:   kind: NoticeKind
 34:   anchor: Anchor
 35:   offsetDays: number
 36:   atMin: number
 37:   channels: readonly Channel[]
 38:   late: "send" | "skip"
 41: export interface Template {
 42:   subject: string
 43:   body: string
 46: export interface Filled {
 47:   text: string
 48:   missing: string[]
 51: export interface Notice {
 52:   id: number
 53:   ref: string
 54:   kind: NoticeKind
 55:   channel: Channel
 56:   to: string
 57:   subject: string
 58:   body: string
 59:   dueAt: number
 60:   state: NoticeState
 61:   tries: number
 62:   sentAt: number
 65: export interface Attempt {
 66:   noticeId: number
 67:   at: number
 68:   ok: boolean
 69:   error: string
 72: export interface DateParts {
 73:   year: number
 74:   month: number
 75:   date: number
 76:   weekday: number
 79: interface Slot {
 80:   due: number
 81:   channel: Channel
 84: export const DAY_MIN = 1440;
 85: export const NO_STAMP = -1;
 86: export const NO_MIN = -1;
 87: export const GIVE_UP = -1;
 89: export const SMS_SINGLE = 160;
 90: export const SMS_MULTI = 153;
 91: export const SMS_MAX_PARTS = 3;
 93: export const HANDOVER_MIN = 870;
 94: export const RETURN_BY_MIN = 570;
 95: export const BALANCE_DAYS = 42;
 97: BALANCE_GRACE_DAYS = 14
 99: export const DEFAULT_QUIET: QuietHours = { fromMin: 1260, toMin: 480 };
101: EPOCH_YEAR = 2024
102: MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
103: MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
104: WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
105: TITLES = ["mr", "mrs", "ms", "miss", "mx", "dr", "prof", "rev"]
107: RETRY_AFTER: readonly number[] = [15, 60, 240, DAY_MIN]
109: POST_RETRY: readonly number[] = [DAY_MIN]
110: PERMANENT = ["opted-out", "unknown-number", "no-such-mailbox", "bad-address"]
111: ERROR_MAX = 80
113: SMS_PENCE = 4
114: POST_PENCE = 87
117: export const RULES: readonly Rule[] = [
168: SIGN_OFF = "Lowmere Wharf\n01632 960144"
170: FIELD_NAMES = [
185: TEMPLATES: Record<NoticeKind, Partial<Record<Channel, Template>>> = {
295: export function stampOf(day: number, min: number): number {
299: export function dayOf(stamp: number): number {
303: export function minOf(stamp: number): number {
307: export function weekdayOf(day: number): number {
311: function isLeap(year: number): boolean {
315: function yearLength(year: number): number {
319: function monthLength(year: number, month: number): number {
323: export function dateOf(day: number): DateParts {
342: export function formatDay(day: number, withYear = false): string {
349: export function formatMin(min: number): string {
364: export function formatStamp(stamp: number): string {
372: export function parseClock(text: string): number {
385: export function formatPence(pence: number): string {
399: export function isQuiet(q: QuietHours, at: number): boolean {
410: export function quietMinutes(q: QuietHours): number {
418: export function clearOfQuiet(q: QuietHours, stamp: number): number {
428: export function parseQuiet(text: string): QuietHours | null {
448: export function mobileOf(phone: string): string {
467: function looksLikeEmail(text: string): boolean {
477: export function reach(b: Booking, channel: Channel): string {
492: export function pickChannel(rule: Rule, b: Booking): Channel | null {
503: export function ruleFor(kind: NoticeKind): Rule {
511: function anchorDay(b: Booking, anchor: Anchor): number {
519: export function whenDue(rule: Rule, b: Booking): number {
530: function slotFor(rule: Rule, b: Booking, now: number, quiet: QuietHours): Slot | null {
546: export function timeline(b: Booking, now: number, quiet: QuietHours = DEFAULT_QUIET): string[] {
561: export function nightsOf(b: Booking): number {
566: export function greetingName(name: string): string {
582: export function fieldsOf(b: Booking): Record<string, string> {
601: export function fill(template: string, fields: Record<string, string>): Filled {
638: export function smsParts(text: string): number {
647: export function clipSms(text: string, parts: number): string {
655: export function render(kind: NoticeKind, channel: Channel, b: Booking): Template {
671: export function checkTemplates(): string[] {
702: export function retryDelay(tries: number, channel: Channel): number {
711: export function isPermanent(error: string): boolean {
716: export function tidyError(error: string): string {
726: function isWaiting(state: NoticeState): boolean {
731: export function sortDue(list: Notice[]): Notice[] {
735: export class Outbox {
736:   private notices: Notice[] = []
738:   private log: Attempt[] = []
739:   private nextId = 1
740:   private readonly quiet: QuietHours
742:   constructor(quiet: QuietHours = DEFAULT_QUIET) {
746:   get size(): number {
752:   plan(b: Booking, now: number): Notice[] {
785:   move(b: Booking, now: number): number {
819:   cancel(ref: string): number {
830:   get(id: number): Notice | undefined {
834:   forBooking(ref: string): Notice[] {
839:   due(now: number, limit = 0): Notice[] {
846:   nextWake(): number {
856:   sent(id: number, now: number): boolean {
869:   failed(id: number, now: number, error: string): number {
887:   requeue(id: number, now: number): boolean {
901:   attemptsFor(id: number): Attempt[] {
906:   lastError(id: number): string {
912:   problems(): string[] {
925:   counts(): Record<NoticeState, number> {
935:   prune(beforeDay: number): number {
955: export function costPence(n: Notice): number {
963: export function spend(list: Notice[]): number {
974: export function byDay(list: Notice[]): Map<number, Notice[]> {
985: export function describe(n: Notice): string {
```

Lines 735 to 951 of the file, as they are:

```ts
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
```

Reply with your change as edits. Each edit is a line 'EDIT: app/<path>' followed by one fenced block of this form:

```
<<<<<<< SEARCH
text that is in the file now, copied exactly
=======
the text to put in its place
>>>>>>> REPLACE
```

The SEARCH text must be found in the file exactly once, or that edit is refused. The edits are applied in the order you give them. An edit with nothing between SEARCH and ======= adds its text at the end of the file. To write a whole file instead, give a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the edits, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
