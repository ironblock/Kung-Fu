// Status messages for the print room.

const herald = openChannel("print room");
const scribe = openChannel("archive");

function announce(text) {
  console.log(text);
}

herald.announce("queue is full"); // @T07
herald.announce(); // @T07
herald.announce("slow job", { ms: elapsed }, attempt); // @T07
herald.announce( // @T07
  "paper jam",
  tray,
);
herald.announce("warming up").then(resume); // @T07

function finish(job) {
  if (!job.ok) herald.announce(job.reason); // @T07
  job.pages.forEach((page) => herald.announce(page.title)); // @T07
  const shown = herald.announce("done").length; // @T07
  console.log(shown);
}

scribe.announce("queue is full");
herald.whisper("queue is full");
herald.announceAll(["toner low", "tray open"]);
announce("queue is full");
room.herald.announce("door open");
tray.on("empty", herald.announce);
const sample = "herald.announce(now)";

class Desk {
  constructor(herald) {
    this.herald = herald;
  }

  open() {
    this.herald.announce("desk open");
  }
}
