I'm working on a small app in /home/dev/15d260/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# No plan when the lock is done for the day

`planDeparture` in `src/tides.ts` always hands back a plan. When there is no time left that day at which the boat could go into the lock, the plan it hands back is nonsense: its times mean nothing, and the hire desk has printed one of them on a customer's sheet.

Please make it return `null` in that case, and change its return type to say so. Whenever the boat can still go into the lock that day, the plan must be exactly what it is now.

Please keep every change inside /home/dev/15d260/app.

You cannot open files or run anything from where you are. Here is what you have of app/src/tides.ts.

Its outline, as `ast-grep outline --view expanded --items all` prints it. Each line is a line number and the first line of a declaration or of one of its members. The rest of the file is not shown.

```
src/tides.ts
  4: export interface HighWater {
  5:   at: number
  7:   height: number
 10: export interface LockWindow {
 11:   opens: number
 12:   closes: number
 14:   depth: number
 17: export interface Departure {
 18:   leave: number
 19:   enter: number
 20:   clear: number
 22:   held: number
 25: export const DAY = 1440;
 26: export const SILL = 310;
 28: LOCKING = 12
 29: KEEL_MARGIN = 25
 30: MAX_BEFORE = 150
 31: MAX_AFTER = 110
 32: KEEPER_FROM = 360
 33: KEEPER_UNTIL = 1200
 34: DUES_PER_METRE = 85
 36: function pad(n: number): string {
 40: export function clock(at: number): string {
 46: export function windowFor(tide: HighWater): LockWindow | null {
 56: export function windowsFor(tides: HighWater[]): LockWindow[] {
 73: export function isOpen(windows: LockWindow[], at: number): boolean {
 77: export function fits(window: LockWindow, draught: number): boolean {
 82: export function deepEnough(windows: LockWindow[], draught: number): LockWindow[] {
 87: export function nextEntry(windows: LockWindow[], at: number): number {
 98: export function lastLeave(window: LockWindow, cruise: number): number {
103: export function spare(windows: LockWindow[], at: number): number {
112: export function boardLine(window: LockWindow): string {
117: export function lockDues(length: number, enter: number): number {
126: export function closeFor(windows: LockWindow[], from: number, to: number): number {
144: export function planDeparture(windows: LockWindow[], ready: number, cruise: number): Departure {
```

Lines 143 to 149 of the file, as they are:

```ts
/** Plans the run down to the lock for a boat that is ready at `ready` and takes `cruise` minutes to reach it. */
export function planDeparture(windows: LockWindow[], ready: number, cruise: number): Departure {
    const entry = nextEntry(windows, ready + cruise);
    // A boat waits at the yard and not on the lock landing, so it leaves late enough to arrive as it can go in.
    const leave = entry - cruise;
    return { leave, enter: entry, clear: entry + LOCKING, held: leave - ready };
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
