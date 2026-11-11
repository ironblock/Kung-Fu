# Kung Fu

Kung Fu asks how little a model has to be told before it uses a tool correctly.

A model meets tools it was never trained on, and tools it was trained on badly. The usual answer is a long guide. Kung Fu looks for the short one: the few facts that close one model's gaps on one tool, each written so the reader can check it by running something.

It is the sibling of Ley Lines. Ley Lines is about one place: what things are there, and where. Kung Fu is about a tool: something that is true wherever the tool is installed.

## Status

There is one pilot, in [`pilot`](pilot). It asks a model to write `ast-grep` commands from a description, with no way to run them, and grades each command on what it matches.

Nothing here is a finding yet. The pilot ran once per arm. Its guide says what it showed, what it does not show, and each claim it has had to take back.

There is also a bench, in [`bench`](bench). It is the instrument the pilot lacked: one subject gets one task, every call the subject makes to the tool is written down, and the output tokens it spends are counted before and after its first right call. No study has been run with it.

## How a result will be judged

These are working rules. They are not settled. [`AGENTS.md`](AGENTS.md) holds the steps that carry them out.

- **Reliability, not luck.** A model passes a task when every one of k tries passes. The tries run over generated variants of the task, not over one string repeated. The pass rate of a single try is reported beside it.
- **The cost is what comes before the first correct answer.** That is the output the model spends, its reasoning included, and the tries that failed.
- **An answer is judged by what it matches.** Never by how it is written.
- **A guide is scored on tasks it was not written from.**
- **The ceiling comes first, under each arm's own conditions.** Before any pass rate is read, a stronger model must pass every task as it is worded, with exactly what the arm's subject is given. A ceiling that saw more than the arm saw says nothing about that arm.
- **The answers are read before a score is explained.** A score cannot tell a subject that got it wrong from a subject that was asked a question it could not answer. A cost cannot either: a subject spends a lot on a hard question, and as much on a question that has no right answer. So each request and each answer is kept, and they are read first.
- **A score is reported with the test's share.** Each failure is sorted: the subject's, the test's, or not known. The three counts stand beside the score.

## License

Apache-2.0. See [LICENSE](LICENSE).
