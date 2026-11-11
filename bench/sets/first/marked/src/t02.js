// Job queue wiring for the batch runner.

const backlog = [];
const pending = "pending";
const finished = "finished";
const solo = "solo";
const depth = 2;
const limit = 10;

function enqueue(batch, priority) {
  backlog.push({ batch, priority });
}

function enqueueAll(batches) {
  batches.forEach((batch) => enqueue(batch));
}

enqueue([3, 5, 8]); // @T02
enqueue(["north", "south"]); // @T02
enqueue([pending, finished]); // @T02
enqueue([loadNext(), 2]); // @T02
enqueue([{ id: 1 }, { id: 2 }]); // @T02
enqueue([[1, 2], [3]]); // @T02
enqueue([solo]); // @T02
enqueue([pending, pending]); // @T02
enqueue([depth, limit - depth]); // @T02
enqueue([
  firstJob, // @T02
  secondJob,
]);

enqueue([1, 2], 3);
enqueue("later", [4, 5]);
enqueue([]);
depot.enqueue([7, 8]);
enqueueAll([1, 2]);
enqueue(wrap([1, 2]));
enqueue({ items: [6, 7] });
const spare = [9, 10];
enqueue(spare);
