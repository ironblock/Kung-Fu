I'm working on a small app in /home/dev/af1815/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Count lateness in yard weeks

In `src/worklog.ts`, `lateBy` tells me how many days late a job is. The office plans by the yard week, so I want the answer in whole yard weeks instead of days.

A job is 0 weeks late while the day it is measured on is in the same yard week as its due day, or in an earlier one. It is 1 week late on every day of the next yard week, 2 on every day of the week after that, and so on.

Use the yard week this file already works with for its weekly summaries. I do not want a second idea of what a week is.

Everything else stays as it is: which day a job is measured on, and the cases where the answer is 0 whatever the day.

Please keep every change inside /home/dev/af1815/app.
