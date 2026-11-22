I'm working on a small app in /home/dev/d616d9/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Keep a reissued notice in its place on the register

In `src/stoppages.ts`, `issue` treats a notice issued again under a reference that is already on the register as a new notice, and puts it on top. The office reissues a notice when it corrects one, and a corrected notice should not start to overrule the notices that were issued after it.

Please change `issue` so that a reissued notice takes the place of the old notice with its reference: the notice it is given stands where the old one stood, and the old one is gone. Every other notice keeps its place. This holds whatever stretch the new notice is for.

A notice whose reference is not on the register still goes on top, as now. Nothing else about `issue` should change: a notice it refuses now, it still refuses in the same way, and then the register is left as it was.

Please keep every change inside /home/dev/d616d9/app.

You cannot open files or run anything from where you are. Here is what you have of app/src/stoppages.ts.

Its outline, as `ast-grep outline --view expanded --items all` prints it. Each line is a line number and the first line of a declaration or of one of its members. The rest of the file is not shown.

```
src/stoppages.ts
  6: export type NoticeKind = "closure" | "restriction";
  8: export type Cause = "works" | "breach" | "water" | "ice" | "event";
 10: export interface Stretch {
 11:   id: string
 12:   name: string
 14:   ends: [string, string]
 15:   furlongs: number
 16:   locks: number
 19: export type Network = Stretch[];
 21: export interface Notice {
 22:   ref: string
 23:   stretch: string
 24:   kind: NoticeKind
 25:   cause: Cause
 26:   from: number
 27:   to: number
 29:   passFrom: number
 30:   passTo: number
 33: export interface Register {
 34:   notices: Notice[]
 37: export interface Route {
 39:   start: string
 40:   stretches: string[]
 43: export interface Leg {
 44:   stretch: string
 45:   enters: string
 46:   leaves: string
 47:   minutes: number
 50: export interface Tally {
 51:   closures: number
 52:   restrictions: number
 53:   openEnded: number
 57: export const OPEN_ENDED = -1;
 59: export const NO_BLOCK = -1;
 61: export const NOT_TODAY = -1;
 63: DAY_MINUTES = 1440
 64: FURLONGS_PER_MILE = 8
 67: MINUTES_PER_MILE = 18
 68: MINUTES_PER_LOCK = 12
 71: ALLOWANCE_PERCENT = 60
 73: CAUSE_WORDS: Record<Cause, string> = {
 81: function clock(minute: number): string {
 86: function stretchOf(network: Network, id: string): Stretch {
 95: function farEnd(stretch: Stretch, junction: string): string {
105: function legMinutes(stretch: Stretch): number {
109: function over(notice: Notice, day: number): boolean {
113: function sharesDay(one: Notice, other: Notice): boolean {
119: export function newRegister(): Register {
123: export function issue(register: Register, notice: Notice): void {
139: export function lift(register: Register, ref: string, day: number): boolean {
151: export function prune(register: Register, day: number): number {
162: export function inForce(notice: Notice, day: number): boolean {
167: export function noticesFor(register: Register, stretch: string): Notice[] {
171: export function noticeOn(register: Register, stretch: string, day: number): Notice | undefined {
176: export function overruled(register: Register, notice: Notice): Notice[] {
184: export function isClosed(register: Register, stretch: string, day: number): boolean {
191: export function passage(register: Register, stretch: string, day: number): [number, number] {
202: export function canPass(register: Register, stretch: string, day: number, minute: number): boolean {
207: export function firstBlock(register: Register, route: Route, day: number): number {
216: export function routeOpen(register: Register, route: Route, day: number): boolean {
221: export function noticesAlong(register: Register, route: Route, day: number): Notice[] {
238: export function reopens(register: Register, stretch: string, day: number): number {
253: export function nextOpenDay(register: Register, route: Route, day: number): number {
271: export function tally(register: Register, day: number): Tally {
289: export function legsOf(network: Network, route: Route): Leg[] {
304: export function endOf(network: Network, route: Route): string {
309: export function routeFurlongs(network: Network, route: Route): number {
317: export function routeLocks(network: Network, route: Route): number {
325: export function cruisingMinutes(network: Network, route: Route): number {
331: export function formatDistance(furlongs: number): string {
341: export function describe(network: Network, notice: Notice): string {
358: export function throughBy(network: Network, register: Register, route: Route, day: number, setOff: number): number {
376: export function wayRound(network: Network, register: Register, route: Route, day: number): Route | null {
417: export function extraMinutes(network: Network, register: Register, route: Route, day: number): number {
425: export function daysLost(network: Network, register: Register, route: Route, startDay: number, nights: number): number {
436: export function allowance(dayRate: number, lost: number): number {
```

Lines 123 to 137 of the file, as they are:

```ts
export function issue(register: Register, notice: Notice): void {
    if (notice.to !== OPEN_ENDED && notice.to <= notice.from) {
        throw new RangeError(`notice ${notice.ref} must cover at least one day`);
    }
    if (notice.kind === "restriction" && notice.passTo <= notice.passFrom) {
        throw new RangeError(`notice ${notice.ref} is a restriction that lets nothing through`);
    }
    // A notice issued again under its old reference replaces the old one and counts as new.
    const old = register.notices.findIndex((each) => each.ref === notice.ref);
    if (old !== -1) {
        register.notices.splice(old, 1);
    }
    // Newest first. A later notice for a stretch overrules the ones under it.
    register.notices.unshift(notice);
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
