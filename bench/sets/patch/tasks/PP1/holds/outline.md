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
