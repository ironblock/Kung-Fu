// Safety surveys of the hire fleet: the checklist, what a survey found, and how long a boat stays certified.
// A day is a whole number counted from the yard's day 0. Nothing here reads a clock: the caller passes the day in.

export type Severity = "advisory" | "minor" | "major" | "critical";
export type Outcome = "pass" | "conditional" | "fail";
export type Area = "hull" | "gas" | "electrics" | "engine" | "fire" | "deck";

export interface Boat {
    name: string;
    berths: number;
    gas: boolean;
    shorePower: boolean;
}

export interface ChecklistItem {
    code: string;
    area: Area;
    title: string;
    severity: Severity;
    minutes: number;
    needs?: "gas" | "shorePower";
}

export interface Finding {
    code: string;
    severity: Severity;
    note: string;
    waived: boolean;
}

export interface SurveyRecord {
    boat: string;
    day: number;
    startedAt: number;
    findings: Finding[];
    outcome: Outcome;
}

export interface Certificate {
    boat: string;
    serial: string;
    from: number;
    expires: number;
    interim: boolean;
}

export interface BoatFile {
    boat: Boat;
    history: SurveyRecord[];
}

// The severity here is what a failure of the item is booked as unless the surveyor says otherwise.
export const CHECKLIST: ChecklistItem[] = [
    { code: "HUL-01", area: "hull", title: "Hull plating sound below waterline", severity: "critical", minutes: 20 },
    { code: "HUL-02", area: "hull", title: "Weed hatch seals and is secured", severity: "critical", minutes: 5 },
    { code: "HUL-03", area: "hull", title: "Bilge dry and bilge pump runs", severity: "major", minutes: 10 },
    { code: "GAS-01", area: "gas", title: "Locker drains overboard", severity: "critical", minutes: 10, needs: "gas" },
    { code: "GAS-02", area: "gas", title: "Pipework holds pressure", severity: "critical", minutes: 15, needs: "gas" },
    { code: "GAS-03", area: "gas", title: "Flame failure cut-outs", severity: "major", minutes: 10, needs: "gas" },
    { code: "ELE-01", area: "electrics", title: "Battery terminals covered", severity: "major", minutes: 5 },
    { code: "ELE-02", area: "electrics", title: "Inlet trips", severity: "major", minutes: 10, needs: "shorePower" },
    { code: "ELE-03", area: "electrics", title: "Navigation and tunnel lights", severity: "minor", minutes: 5 },
    { code: "ENG-01", area: "engine", title: "Fuel lines and shut-off valve", severity: "critical", minutes: 10 },
    { code: "ENG-02", area: "engine", title: "Engine mounts and drive coupling", severity: "major", minutes: 10 },
    { code: "ENG-03", area: "engine", title: "Exhaust lagging intact", severity: "minor", minutes: 5 },
    { code: "FIR-01", area: "fire", title: "Extinguishers in date, one by each exit", severity: "major", minutes: 5 },
    { code: "FIR-02", area: "fire", title: "Smoke and monoxide alarms sound", severity: "major", minutes: 5 },
    { code: "FIR-03", area: "fire", title: "Fire blanket by the galley", severity: "minor", minutes: 4 },
    { code: "DEK-01", area: "deck", title: "Handrails and non-slip surfaces", severity: "minor", minutes: 5 },
    { code: "DEK-02", area: "deck", title: "Lifebuoy and throw line at the stern", severity: "major", minutes: 3 },
    { code: "DEK-03", area: "deck", title: "Fenders and mooring lines", severity: "advisory", minutes: 3 },
];

const RANK: Record<Severity, number> = {
    advisory: 0,
    minor: 1,
    major: 2,
    critical: 3,
};

// The surveyor's working day.
const HOURS = {
    opens: 480,
    closes: 1020,
};

const COVER_DAYS: Record<Outcome, number> = {
    pass: 365,
    conditional: 21,
    fail: 0,
};

const FEES = {
    full: 14500,
    perBerth: 725,
};

const MAX_MAJORS = 2;
const EARLY_DAYS = 28;
const RESURVEY_DAYS = 14;

function tidyCode(code: string): string {
    return code.trim().toUpperCase();
}

function plural(n: number, word: string): string {
    return `${n} ${word}${n === 1 ? "" : "s"}`;
}

export function findItem(code: string): ChecklistItem | undefined {
    const wanted = tidyCode(code);
    return CHECKLIST.find((item) => item.code === wanted);
}

export function checklistFor(boat: Boat): ChecklistItem[] {
    return CHECKLIST.filter((item) => item.needs === undefined || boat[item.needs]);
}

export function plannedMinutes(boat: Boat): number {
    let total = 0;
    for (const item of checklistFor(boat)) {
        total += item.minutes;
    }
    // a bigger boat takes longer to walk through: five minutes for each berth above four
    total += Math.max(0, boat.berths - 4) * 5;
    // the diary is kept in quarter hours
    return Math.ceil(total / 15) * 15;
}

export function fitsWorkingDay(boat: Boat, startedAt: number): boolean {
    const end = startedAt + plannedMinutes(boat);
    // finishing on the stroke of closing time is allowed
    return startedAt >= HOURS.opens && end <= HOURS.closes;
}

export function latestStart(boat: Boat): number {
    return HOURS.closes - plannedMinutes(boat);
}

export function clockLabel(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

export function makeFinding(code: string, note: string, severity?: Severity): Finding {
    const item = findItem(code);
    if (item === undefined) {
        throw new Error(`no checklist item ${tidyCode(code)}`);
    }
    return { code: item.code, severity: severity ?? item.severity, note: note.trim(), waived: false };
}

export function sortFindings(findings: Finding[]): Finding[] {
    // worst first, in place; findings of one severity keep the order they were written down in
    return findings.sort((a, b) => RANK[b.severity] - RANK[a.severity]);
}

export function outcomeOf(findings: Finding[]): Outcome {
    let majors = 0;
    for (const finding of findings) {
        if (finding.waived) {
            continue;
        }
        if (finding.severity === "critical") {
            return "fail";
        }
        if (finding.severity === "major") {
            majors += 1;
        }
    }
    if (majors > MAX_MAJORS) {
        return "fail";
    }
    return majors > 0 ? "conditional" : "pass";
}

export function closeSurvey(boat: string, day: number, startedAt: number, findings: Finding[]): SurveyRecord {
    // the record keeps its own copies, so the surveyor's sheet can be reused for the next boat
    const kept = sortFindings(findings.map((finding) => ({ ...finding })));
    return { boat, day, startedAt, findings: kept, outcome: outcomeOf(kept) };
}

export function addFinding(record: SurveyRecord, finding: Finding): void {
    const at = record.findings.findIndex((f) => f.code === finding.code && !f.waived);
    if (at === -1) {
        record.findings.push({ ...finding });
    } else if (RANK[finding.severity] > RANK[record.findings[at].severity]) {
        // one standing finding for an item: the worse of the two is kept
        record.findings[at] = { ...finding };
    }
    sortFindings(record.findings);
    record.outcome = outcomeOf(record.findings);
}

export function waive(record: SurveyRecord, code: string, reason: string): boolean {
    const wanted = tidyCode(code);
    const finding = record.findings.find((f) => f.code === wanted && !f.waived);
    // a critical finding is never waived
    if (finding === undefined || finding.severity === "critical") {
        return false;
    }
    finding.waived = true;
    finding.note = finding.note === "" ? `waived: ${reason}` : `${finding.note} (waived: ${reason})`;
    record.outcome = outcomeOf(record.findings);
    return true;
}

/** The items to look at again on a return visit: every major or critical finding still standing. */
export function reinspectList(record: SurveyRecord): string[] {
    const codes = new Set<string>();
    for (const finding of record.findings) {
        if (!finding.waived && RANK[finding.severity] >= RANK.major) {
            codes.add(finding.code);
        }
    }
    // in the order of the checklist, not of the findings
    return CHECKLIST.filter((item) => codes.has(item.code)).map((item) => item.code);
}

export function needsSlipway(record: SurveyRecord): boolean {
    // hull work at major or worse cannot be done afloat
    return record.findings.some((finding) => {
        const item = findItem(finding.code);
        return !finding.waived && item?.area === "hull" && RANK[finding.severity] >= RANK.major;
    });
}

export function summaryLine(record: SurveyRecord): string {
    const head = `${record.boat} day ${record.day} ${clockLabel(record.startedAt)} ${record.outcome}`;
    if (record.findings.length === 0) {
        return `${head}, clean`;
    }
    const waived = record.findings.filter((finding) => finding.waived).length;
    const tail = waived > 0 ? ` (${waived} waived)` : "";
    return `${head}, ${plural(record.findings.length, "finding")}${tail}`;
}

export function fileSurvey(history: SurveyRecord[], record: SurveyRecord): number {
    // newest first; a second survey on one day goes ahead of the first
    let at = 0;
    while (at < history.length && history[at].day > record.day) {
        at += 1;
    }
    history.splice(at, 0, record);
    return at;
}

export function lastPassDay(history: SurveyRecord[]): number {
    for (const record of history) {
        if (record.outcome === "pass") {
            return record.day;
        }
    }
    return -1;
}

export function surveysBetween(history: SurveyRecord[], from: number, to: number): SurveyRecord[] {
    // oldest first, as the printed log has them
    return history.filter((record) => record.day >= from && record.day < to).reverse();
}

export function passRate(history: SurveyRecord[], from: number, to: number): number {
    const held = surveysBetween(history, from, to);
    if (held.length === 0) {
        return -1;
    }
    const passed = held.filter((record) => record.outcome === "pass").length;
    // whole percent, rounded down
    return Math.floor((passed * 100) / held.length);
}

function serialFor(boat: string, from: number, interim: boolean): string {
    const stem = boat.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 6);
    return `${interim ? "IC" : "SC"}-${stem}-${String(from).padStart(5, "0")}`;
}

/** The certificate a survey earns, if any. `previous` is the last one issued to the boat, lapsed or not. */
export function issueCertificate(record: SurveyRecord, previous: Certificate | null): Certificate | null {
    if (record.outcome === "fail") {
        return null;
    }
    const interim = record.outcome === "conditional";
    // an interim certificate is never followed by another: the boat has to pass
    if (interim && previous !== null && previous.interim) {
        return null;
    }
    let from = record.day;
    if (!interim && previous !== null && !previous.interim) {
        const early = previous.expires - record.day;
        // a pass in the last four weeks of a full certificate carries on from where that one ends
        if (early > 0 && early <= EARLY_DAYS) {
            from = previous.expires;
        }
    }
    // expires is the first day the boat may not go out: a pass on day 100 covers days 100 to 464
    const expires = from + COVER_DAYS[record.outcome];
    return { boat: record.boat, serial: serialFor(record.boat, from, interim), from, expires, interim };
}

export function certificates(history: SurveyRecord[]): Certificate[] {
    const issued: Certificate[] = [];
    // replay oldest to newest, so that each survey sees the certificate before it
    for (let i = history.length - 1; i >= 0; i -= 1) {
        const record = history[i];
        const cert = issueCertificate(record, issued.length > 0 ? issued[0] : null);
        if (cert === null || cert.from === record.day) {
            // a survey that does not carry on from the old certificate ends it that day
            for (const earlier of issued) {
                earlier.expires = Math.min(earlier.expires, record.day);
            }
        }
        if (cert !== null) {
            issued.unshift(cert);
        }
    }
    return issued;
}

export function currentCertificate(history: SurveyRecord[], day: number): Certificate | null {
    for (const cert of certificates(history)) {
        if (day >= cert.from && day < cert.expires) {
            return cert;
        }
    }
    return null;
}

export function isCertified(history: SurveyRecord[], day: number): boolean {
    return currentCertificate(history, day) !== null;
}

/** When the cover in force on `day` runs out, following on into a certificate that carries on from it. */
export function runsOut(history: SurveyRecord[], day: number): number {
    const issued = certificates(history);
    let end = -1;
    let at = day;
    for (let i = issued.length - 1; i >= 0; i -= 1) {
        if (at >= issued[i].from && at < issued[i].expires) {
            end = issued[i].expires;
            at = end;
        }
    }
    // -1 when the boat has no cover on the day
    return end;
}

/** The days on which a pass would carry on from the full certificate in force on `day`, if there is one. */
export function renewalWindow(history: SurveyRecord[], day: number): { opens: number; closes: number } | null {
    const cert = currentCertificate(history, day);
    if (cert === null || cert.interim) {
        return null;
    }
    // closes is the first day that is too late
    return { opens: cert.expires - EARLY_DAYS, closes: cert.expires };
}

export function dueForSurvey(fleet: BoatFile[], today: number, within: number): string[] {
    const due: { name: string; ends: number }[] = [];
    for (const file of fleet) {
        const ends = runsOut(file.history, today);
        if (ends === -1 || ends - today <= within) {
            due.push({ name: file.boat.name, ends });
        }
    }
    // boats with no cover come out first, then the soonest to run out; ties stay in fleet order
    due.sort((a, b) => a.ends - b.ends);
    return due.map((entry) => entry.name);
}

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

/** What the yard charges the hire company for a survey of the boat on `day`, before it is filed. */
export function surveyFee(boat: Boat, day: number, history: SurveyRecord[]): number {
    let fee = FEES.full + Math.max(0, boat.berths - 6) * FEES.perBerth;
    const last = history.length > 0 ? history[0] : null;
    if (last !== null && last.outcome !== "pass" && day - last.day <= RESURVEY_DAYS) {
        // going back to look again: free after a conditional, half price after a fail
        fee = last.outcome === "conditional" ? 0 : Math.floor(fee / 2);
    }
    return fee;
}

export function feeLabel(fee: number): string {
    return `£${Math.floor(fee / 100)}.${String(fee % 100).padStart(2, "0")}`;
}

export function openBySeverity(findings: Finding[]): Record<Severity, number> {
  const counts: Record<Severity, number> = {
    advisory: 0,
    minor: 0,
    major: 0,
    critical: 0,
  };
  for (const finding of findings) {
    if (!finding.waived) {
      counts[finding.severity] += 1;
    }
  }
  return counts;
}
