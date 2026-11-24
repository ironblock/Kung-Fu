You cannot open files or run anything from where you are. Here is what you have of app/src/survey.ts.

Its outline, as `ast-grep outline --view expanded --items all` prints it. Each line is a line number and the first line of a declaration or of one of its members. The rest of the file is not shown.

```
src/survey.ts
  4: export type Severity = "advisory" | "minor" | "major" | "critical";
  5: export type Outcome = "pass" | "conditional" | "fail";
  6: export type Area = "hull" | "gas" | "electrics" | "engine" | "fire" | "deck";
  8: export interface Boat {
  9:   name: string
 10:   berths: number
 11:   gas: boolean
 12:   shorePower: boolean
 15: export interface ChecklistItem {
 16:   code: string
 17:   area: Area
 18:   title: string
 19:   severity: Severity
 20:   minutes: number
 21:   needs?: "gas" | "shorePower"
 24: export interface Finding {
 25:   code: string
 26:   severity: Severity
 27:   note: string
 28:   waived: boolean
 31: export interface SurveyRecord {
 32:   boat: string
 33:   day: number
 34:   startedAt: number
 35:   findings: Finding[]
 36:   outcome: Outcome
 39: export interface Certificate {
 40:   boat: string
 41:   serial: string
 42:   from: number
 43:   expires: number
 44:   interim: boolean
 47: export interface BoatFile {
 48:   boat: Boat
 49:   history: SurveyRecord[]
 53: export const CHECKLIST: ChecklistItem[] = [
 74: RANK: Record<Severity, number> = {
 82: HOURS = {
 87: COVER_DAYS: Record<Outcome, number> = {
 93: FEES = {
 98: MAX_MAJORS = 2
 99: EARLY_DAYS = 28
100: RESURVEY_DAYS = 14
102: function tidyCode(code: string): string {
106: function plural(n: number, word: string): string {
110: export function findItem(code: string): ChecklistItem | undefined {
115: export function checklistFor(boat: Boat): ChecklistItem[] {
119: export function plannedMinutes(boat: Boat): number {
130: export function fitsWorkingDay(boat: Boat, startedAt: number): boolean {
136: export function latestStart(boat: Boat): number {
140: export function clockLabel(minutes: number): string {
145: export function makeFinding(code: string, note: string, severity?: Severity): Finding {
153: export function sortFindings(findings: Finding[]): Finding[] {
158: export function outcomeOf(findings: Finding[]): Outcome {
177: export function closeSurvey(boat: string, day: number, startedAt: number, findings: Finding[]): SurveyRecord {
183: export function addFinding(record: SurveyRecord, finding: Finding): void {
195: export function waive(record: SurveyRecord, code: string, reason: string): boolean {
209: export function reinspectList(record: SurveyRecord): string[] {
220: export function needsSlipway(record: SurveyRecord): boolean {
228: export function summaryLine(record: SurveyRecord): string {
238: export function fileSurvey(history: SurveyRecord[], record: SurveyRecord): number {
248: export function lastPassDay(history: SurveyRecord[]): number {
257: export function surveysBetween(history: SurveyRecord[], from: number, to: number): SurveyRecord[] {
262: export function passRate(history: SurveyRecord[], from: number, to: number): number {
272: function serialFor(boat: string, from: number, interim: boolean): string {
278: export function issueCertificate(record: SurveyRecord, previous: Certificate | null): Certificate | null {
300: export function certificates(history: SurveyRecord[]): Certificate[] {
319: export function currentCertificate(history: SurveyRecord[], day: number): Certificate | null {
328: export function isCertified(history: SurveyRecord[], day: number): boolean {
333: export function runsOut(history: SurveyRecord[], day: number): number {
348: export function renewalWindow(history: SurveyRecord[], day: number): { opens: number; closes: number } | null {
357: export function dueForSurvey(fleet: BoatFile[], today: number, within: number): string[] {
370: export function certificateLine(boat: string, cert: Certificate | null, today: number): string {
382: export function surveyFee(boat: Boat, day: number, history: SurveyRecord[]): number {
392: export function feeLabel(fee: number): string {
```

Lines 370 to 379 of the file, as they are:

```ts
export function certificateLine(boat: string, cert: Certificate | null, today: number): string {
    if (cert === null) {
        return `${boat}: no certificate`;
    }
    const what = `${cert.interim ? "interim " : ""}certificate ${cert.serial}`;
    if (today < cert.from) {
        return `${boat}: ${what}, starts in ${plural(cert.from - today, "day")}`;
    }
    return `${boat}: ${what}`;
}
```
