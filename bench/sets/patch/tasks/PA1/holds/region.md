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

Lines 49 to 52 of the file, as they are:

```ts
export function fits(boat: Boat, berth: Berth): boolean {
    // the lines may use the berth to its last centimetre, but the hull must be strictly narrower
    return boat.length + ROPE_ROOM <= berth.length && boat.beam < berth.beam;
}
```
