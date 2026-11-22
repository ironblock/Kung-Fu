I'm working on a small app in /home/dev/bf3652/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Let an earlier finisher sign a job off

In `src/worklog.ts`, `WorkLog.move` refuses a move to `signed` by anyone who has ever finished the job. That is stricter than our insurer asks. When a job was finished, reopened and finished again, the person who finished it the first time is often the best one to check the second piece of work.

Please change it so that a move to `signed` is refused only when `by` is the same name as the `by` of the job's most recent move to `done`. Compare the two names exactly as they are written, with no trimming and no change of case.

So after a second finish, the person who finished it the first time may sign it, and the person who finished it last may not. A refused move still returns `false` and leaves the job as it was. Every other move stays as it is.

Please keep every change inside /home/dev/bf3652/app.
