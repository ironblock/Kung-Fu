import { describe, expect, it } from "vitest";
import * as mod from "../src/worklog";
import { copyOf } from "./helpers";
import { unchanged } from "./helpers-worklog";

type Log = InstanceType<typeof mod.WorkLog>;

/** One job, opened by Ann on day 10 and finished by `finisher` on day 14. */
function finished(finisher: string): Log {
    const log = new mod.WorkLog();
    log.open("Kestrel", "Stern gland weeping", "soon", 10, "Ann");
    log.move(1, "booked", 11, "Cy");
    log.move(1, "started", 12, "Dee");
    log.move(1, "done", 14, finisher);
    return log;
}

/** Finished by Ann on day 14, reopened by Cy on day 15, finished again by Bo on day 16. */
function finishedTwice(): Log {
    const log = finished("Ann");
    log.move(1, "started", 15, "Cy");
    log.move(1, "done", 16, "Bo");
    return log;
}

describe("WorkLog.move: sign-off by a second person", () => {
    it("refuses a signing by the person who finished the job, and leaves the job as it was", () => {
        const log = finished("Bo");
        const before = copyOf(log.get(1));
        expect(log.move(1, "signed", 15, "Bo")).toBe(false);
        expect(log.get(1)).toEqual(before);
        expect(log.get(1)?.state).toBe("done");
        expect(log.get(1)?.history.length).toBe(4);
        expect(log.get(1)?.closedDay).toBe(14);
    });

    it("refuses it on the day the job was finished too", () => {
        const log = finished("Bo");
        expect(log.move(1, "signed", 14, "Bo")).toBe(false);
        expect(log.get(1)?.state).toBe("done");
    });

    it("takes a signing by someone else, and records it", () => {
        const log = finished("Bo");
        expect(log.move(1, "signed", 15, "Eve")).toBe(true);
        expect(log.get(1)?.state).toBe("signed");
        expect(log.get(1)?.history[0]).toEqual({ to: "signed", day: 15, by: "Eve" });
        expect(log.get(1)?.history.length).toBe(5);
        expect(log.get(1)?.closedDay).toBe(14);
    });

    it("lets the people who opened, booked and started the job sign it", () => {
        expect(finished("Bo").move(1, "signed", 15, "Ann")).toBe(true);
        expect(finished("Bo").move(1, "signed", 15, "Cy")).toBe(true);
        expect(finished("Bo").move(1, "signed", 15, "Dee")).toBe(true);
    });

    it("refuses the finisher even when the same person also opened the job", () => {
        const log = finished("Ann");
        expect(log.move(1, "signed", 15, "Ann")).toBe(false);
        expect(log.get(1)?.state).toBe("done");
    });

    it("compares the names exactly as written", () => {
        expect(finished("Bo").move(1, "signed", 15, "bo")).toBe(true);
        expect(finished("Bo").move(1, "signed", 15, "Bo ")).toBe(true);
        expect(finished("Bo").move(1, "signed", 15, " Bo")).toBe(true);
        expect(finished("Bo").move(1, "signed", 15, "Bob")).toBe(true);
        expect(finished("Bob").move(1, "signed", 15, "Bo")).toBe(true);
    });

    it("compares the finisher's name exactly as it was written too", () => {
        expect(finished(" Bo").move(1, "signed", 15, "Bo")).toBe(true);
        expect(finished(" Bo").move(1, "signed", 15, " Bo")).toBe(false);
        expect(finished("bo").move(1, "signed", 15, "Bo")).toBe(true);
        expect(finished("bo").move(1, "signed", 15, "bo")).toBe(false);
    });

    it("a refused signing does not stop a later one by someone else", () => {
        const log = finished("Bo");
        expect(log.move(1, "signed", 15, "Bo")).toBe(false);
        expect(log.move(1, "signed", 15, "Ann")).toBe(true);
        expect(log.get(1)?.history.map((m) => m.to)).toEqual(["signed", "done", "started", "booked", "reported"]);
    });

    it("after a second finish, the person who finished it first may sign", () => {
        const log = finishedTwice();
        expect(log.move(1, "signed", 17, "Ann")).toBe(true);
        expect(log.get(1)?.state).toBe("signed");
        expect(log.get(1)?.closedDay).toBe(16);
    });

    it("after a second finish, the person who finished it last may not sign", () => {
        const log = finishedTwice();
        const before = copyOf(log.get(1));
        expect(log.move(1, "signed", 17, "Bo")).toBe(false);
        expect(log.get(1)).toEqual(before);
    });

    it("after a second finish by the same person as the first, that person may not sign", () => {
        const log = finished("Ann");
        log.move(1, "started", 15, "Cy");
        log.move(1, "done", 16, "Ann");
        expect(log.move(1, "signed", 17, "Ann")).toBe(false);
        expect(log.move(1, "signed", 17, "Cy")).toBe(true);
    });

    it("after two finishes on one day, the later one is the most recent", () => {
        const twice = (): Log => {
            const log = finished("Ann");
            log.move(1, "started", 14, "Cy");
            log.move(1, "done", 14, "Bo");
            return log;
        };
        expect(twice().move(1, "signed", 14, "Ann")).toBe(true);
        expect(twice().move(1, "signed", 14, "Bo")).toBe(false);
    });

    it("after three finishes, only the last counts", () => {
        const thrice = (): Log => {
            const log = finishedTwice();
            log.move(1, "started", 17, "Dee");
            log.move(1, "done", 18, "Cy");
            return log;
        };
        expect(thrice().move(1, "signed", 19, "Ann")).toBe(true);
        expect(thrice().move(1, "signed", 19, "Bo")).toBe(true);
        expect(thrice().move(1, "signed", 19, "Cy")).toBe(false);
        expect(thrice().get(1)?.history.length).toBe(8);
    });

    it("the person who finished a job may still reopen it, and finish it again", () => {
        const log = finished("Bo");
        expect(log.move(1, "started", 15, "Bo")).toBe(true);
        expect(log.get(1)?.closedDay).toBe(-1);
        expect(log.move(1, "done", 15, "Bo")).toBe(true);
        expect(log.move(1, "signed", 15, "Bo")).toBe(false);
        expect(log.move(1, "signed", 15, "Dee")).toBe(true);
    });

    it("still refuses a signing the table does not allow, whoever asks", () => {
        const log = new mod.WorkLog();
        log.open("Kestrel", "Stern gland weeping", "urgent", 10, "Ann");
        log.move(1, "started", 10, "Bo");
        expect(log.move(1, "signed", 11, "Eve")).toBe(false);
        expect(log.move(1, "signed", 11, "Bo")).toBe(false);
        expect(log.get(1)?.state).toBe("started");
        log.move(1, "done", 12, "Bo");
        expect(log.move(1, "signed", 11, "Eve")).toBe(false);
        expect(log.move(1, "signed", 12, "Eve")).toBe(true);
    });
});

unchanged(mod, ["WorkLog.move: nor may anyone who finished it before it was reopened"]);
