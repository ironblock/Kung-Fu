import { describe, expect, it } from "vitest";
import * as mod from "../src/survey";
import { unchanged } from "./helpers-survey";

type Outcome = import("../src/survey").Outcome;
type SurveyRecord = import("../src/survey").SurveyRecord;

function rec(boat: string, day: number, outcome: Outcome): SurveyRecord {
    return { boat, day, startedAt: 570, findings: [], outcome };
}

describe("certificateLine, with the cover that is left", () => {
    // A pass on day 1000, with no certificate before it: the module's own certificate for it.
    const history = [rec("Heron", 1000, "pass")];
    const certificate = () => mod.issueCertificate(history[0], null);

    it("on the certificate's first day, every day of it is left", () => {
        const full = certificate();
        const days = [1000, 1001, 1002].filter((day) => mod.isCertified(history, day)).length;
        expect(days).toBe(3);
        expect(mod.certificateLine("Heron", full, 1000)).toBe("Heron: certificate SC-HERON-01000, 365 days left");
    });

    it("counts today among the days left", () => {
        const full = certificate();
        expect(mod.certificateLine("Heron", full, 1001)).toBe("Heron: certificate SC-HERON-01000, 364 days left");
        expect(mod.certificateLine("Heron", full, 1353)).toBe("Heron: certificate SC-HERON-01000, 12 days left");
        expect(mod.certificateLine("Heron", full, 1363)).toBe("Heron: certificate SC-HERON-01000, 2 days left");
    });

    it("the last day the boat may go out is `1 day left`", () => {
        const full = certificate();
        expect(mod.isCertified(history, 1364)).toBe(true);
        expect(mod.isCertified(history, 1365)).toBe(false);
        expect(mod.certificateLine("Heron", full, 1364)).toBe("Heron: certificate SC-HERON-01000, 1 day left");
    });

    it("the first day the boat may not go out is `lapsed`, and so is every day after", () => {
        const full = certificate();
        expect(mod.certificateLine("Heron", full, 1365)).toBe("Heron: certificate SC-HERON-01000, lapsed");
        expect(mod.certificateLine("Heron", full, 1366)).toBe("Heron: certificate SC-HERON-01000, lapsed");
        expect(mod.certificateLine("Heron", full, 2000)).toBe("Heron: certificate SC-HERON-01000, lapsed");
    });

    it("an interim certificate's line gets the same ending", () => {
        const interim = mod.issueCertificate(rec("Teal", 1010, "conditional"), null);
        expect(mod.certificateLine("Teal", interim, 1010)).toBe("Teal: interim certificate IC-TEAL-01010, 21 days left");
        expect(mod.certificateLine("Teal", interim, 1029)).toBe("Teal: interim certificate IC-TEAL-01010, 2 days left");
        expect(mod.certificateLine("Teal", interim, 1030)).toBe("Teal: interim certificate IC-TEAL-01010, 1 day left");
        expect(mod.certificateLine("Teal", interim, 1031)).toBe("Teal: interim certificate IC-TEAL-01010, lapsed");
    });

    it("a certificate that a failed survey ended early has only its own days left", () => {
        const ended = [rec("Heron", 1100, "fail"), rec("Heron", 1000, "pass")];
        const cert = mod.certificates(ended)[0];
        expect(mod.isCertified(ended, 1099)).toBe(true);
        expect(mod.isCertified(ended, 1100)).toBe(false);
        expect(mod.certificateLine("Heron", cert, 1090)).toBe("Heron: certificate SC-HERON-01000, 10 days left");
        expect(mod.certificateLine("Heron", cert, 1099)).toBe("Heron: certificate SC-HERON-01000, 1 day left");
        expect(mod.certificateLine("Heron", cert, 1100)).toBe("Heron: certificate SC-HERON-01000, lapsed");
    });

    it("an interim certificate that a second conditional ended early has only its own days left", () => {
        const ended = [rec("Heron", 1015, "conditional"), rec("Heron", 1000, "conditional")];
        const cert = mod.certificates(ended)[0];
        expect(mod.isCertified(ended, 1014)).toBe(true);
        expect(mod.isCertified(ended, 1015)).toBe(false);
        expect(mod.certificateLine("Heron", cert, 1012)).toBe("Heron: interim certificate IC-HERON-01000, 3 days left");
        expect(mod.certificateLine("Heron", cert, 1014)).toBe("Heron: interim certificate IC-HERON-01000, 1 day left");
        expect(mod.certificateLine("Heron", cert, 1015)).toBe("Heron: interim certificate IC-HERON-01000, lapsed");
        expect(mod.certificateLine("Heron", cert, 1016)).toBe("Heron: interim certificate IC-HERON-01000, lapsed");
    });

    it("the lines for no certificate and for one that has not started are as they were", () => {
        const full = certificate();
        const next = mod.issueCertificate(rec("Heron", 1340, "pass"), full);
        expect(mod.certificateLine("Heron", null, 1364)).toBe("Heron: no certificate");
        expect(mod.certificateLine("Heron", next, 1364)).toBe("Heron: certificate SC-HERON-01365, starts in 1 day");
        expect(mod.certificateLine("Heron", next, 1365)).toBe("Heron: certificate SC-HERON-01365, 365 days left");
    });

    it("a certificate that a fail ended before it started still says when it starts", () => {
        const failed = [rec("Heron", 1350, "fail"), rec("Heron", 1340, "pass"), rec("Heron", 1000, "pass")];
        const next = mod.certificates(failed)[0];
        expect([next.serial, next.from]).toEqual(["SC-HERON-01365", 1365]);
        expect(mod.certificateLine("Heron", next, 1360)).toBe("Heron: certificate SC-HERON-01365, starts in 5 days");
        expect(mod.certificateLine("Heron", next, 1364)).toBe("Heron: certificate SC-HERON-01365, starts in 1 day");
    });
});

unchanged(mod, [
    "certificateLine: a full certificate that has started is named by its serial",
    "certificateLine: an interim certificate that has started is called interim",
]);
