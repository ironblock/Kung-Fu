I'm working on a small app in /home/dev/73531f/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Log a shift along the quay as one move

`shift` in `src/moorings.ts` moves a boat from its berth to another one. It leaves two entries in the log: one that takes the boat off the quay, and one that puts it back on. Anyone reading the log thinks the boat left the yard.

I want it to leave a single entry instead: one move for the day given, with `from` the berth the boat left and `to` the berth it went to. That entry must be logged in the same way as every other move, so that the log reads as it always has.

When the shift is refused, the log stays untouched, as now. What `shift` returns, and what it does to the berths, stay as they are.

Please keep every change inside /home/dev/73531f/app.

You cannot open files or run anything from where you are. Here is what you have of app/src/moorings.ts.

Its outline, as `ast-grep outline --view expanded --items all` prints it. Each line is a line number and the first line of a declaration or of one of its members. The rest of the file is not shown.

```
src/moorings.ts
  4: export type BerthId = string;
  6: export interface Boat {
  7:   id: string
  8:   name: string
  9:   length: number
 10:   beam: number
 13: export interface Berth {
 14:   id: BerthId
 15:   length: number
 16:   beam: number
 17:   power: boolean
 19:   boatId: string
 23: export interface Move {
 24:   day: number
 25:   boatId: string
 27:   from: BerthId
 28:   to: BerthId
 32: ROPE_ROOM = 60
 34: NARROW_BEAM = 215
 36: NIGHT_RATE = { narrow: 45, wide: 70 }
 37: POWER_FEE = 250
 38: LONG_STAY = 7
 39: LONG_STAY_OFF = 10
 41: function isFree(berth: Berth): boolean {
 45: function metres(size: number): string {
 49: export function fits(boat: Boat, berth: Berth): boolean {
 55: export function bestBerth(boat: Boat, berths: Berth[]): Berth | undefined {
 65: export function berthOf(berths: Berth[], boatId: string): Berth | undefined {
 70: export function assign(berths: Berth[], boat: Boat, berthId: BerthId, day: number, log: Move[]): boolean {
 81: export function release(berths: Berth[], boatId: string, day: number, log: Move[]): BerthId {
 90: export function shift(berths: Berth[], boat: Boat, toId: BerthId, day: number, log: Move[]): boolean {
 97: export function lastMove(log: Move[], boatId: string): Move | undefined {
102: export function berthOn(log: Move[], boatId: string, day: number): BerthId {
107: export function nightlyFee(boat: Boat, onPower: boolean): number {
112: export function stayFee(boat: Boat, onPower: boolean, fromDay: number, toDay: number): number {
124: export function quayLoad(berths: Berth[]): number {
135: export function boardLine(berth: Berth, boats: Boat[]): string {
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
