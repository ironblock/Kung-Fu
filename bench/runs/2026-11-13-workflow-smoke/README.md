# 2026-11-13-workflow-smoke: five tries launched by a workflow, to see that the bench can keep them

This was written before the run.

- **What.** The Haiku model, as a subject of the kind `bench-subject`, on T01, T02, T03, T04 and T06 of the set `outline`, in variant 0, with the tool and no guide: five tries. They are the same five tries as `../2026-11-13-fourth-a/none/*/v0` and `../2026-11-13-third-shell/none/*/v0`, with the same request but for the path. Those were launched by hand, one call for each subject. These are launched by one workflow script, which builds each request from one template.
- **Why.** On 2026-11-13 the maintainer said to move the tries to a workflow, after a smoke test. Launched by hand, each subject's report comes back into the session that runs the study, before all tries are kept, and each request is copied by hand. A workflow can hold the reports back and builds the requests itself.
- **It measures nothing about a guide.** Five tries in one arm. No comparison is made, and the numbers of what a subject read are looked at for one thing only: whether a subject launched this way starts where one launched by hand starts.

**What is checked, and what each outcome changes.**

1. **Found and kept.** `claude_code.py` finds each subject's record and `keep.py` keeps it: the request word for word, the answer, the calls. If the records lie elsewhere or have another shape, the note says what had to change. If they cannot be kept, the tries stay launched by hand.
2. **The same kind of subject.** The record names `bench-subject` and the tools it was handed, the Haiku model, and the effort the harness ran it at. By hand that was medium.
3. **The same start.** By hand a subject's first request was 7,065 tokens for these tries, and the harness handed it 8,401 characters after its first message. If a subject launched by a workflow starts elsewhere, a study uses one way of launching throughout, and no round launched one way is set beside a round launched the other.
4. **The reports stay out.** The workflow hands back whether each subject finished and how long its last words were, and nothing of what it said.
5. **Each try passes.** By hand all ten did. A failure here is read before anything else is.

- **What it should cost:** about 16,500 output tokens of the Haiku model, five times what such a try cost by hand.
