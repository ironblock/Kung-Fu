I'm working on a small app in /home/dev/36a7a0/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Drop the slivers a closure leaves behind

When the lock is taken out of use for part of a window, `closeFor` in `src/tides.ts` keeps whatever is left of that window on either side. Sometimes what is left is too short for a boat to lock through, and it only clutters the day's list.

Please change it so that a piece left over from a window the closure cuts is kept only when it is at least 12 minutes long, which is the time one locking takes. A shorter piece is dropped, and its minutes are added to the number the function returns, since they are lost as well. A piece of exactly 12 minutes stays.

A window the closure does not touch is left as it is, however short it may be. Everything else about the function stays as it is now.

Please keep every change inside /home/dev/36a7a0/app.

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

Reply with your change as edits. Each edit is a line 'EDIT: app/<path>' followed by one fenced block of this form:

```
<<<<<<< SEARCH
text that is in the file now, copied exactly
=======
the text to put in its place
>>>>>>> REPLACE
```

The SEARCH text must be found in the file exactly once, or that edit is refused. The edits are applied in the order you give them. An edit with nothing between SEARCH and ======= adds its text at the end of the file. To write a whole file instead, give a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the edits, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
