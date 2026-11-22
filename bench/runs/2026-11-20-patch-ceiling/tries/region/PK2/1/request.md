I'm working on a small app in /home/dev/91ef15/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Five minor findings should count as a major one

In `src/survey.ts`, `outcomeOf` takes no account of minor findings, however many a survey has. Our insurer no longer accepts that, so I want it changed: when a survey has five or more minor findings, together they count as one major finding, on top of the major findings that function counts now, in each of its rules about major findings. So five minor findings and nothing worse make a survey conditional, where today it passes. Ten minor findings still count as one major finding, not two. A waived minor finding does not count towards the five, and advisories are not counted with the minors. Four minor findings or fewer change nothing.

Please keep every change inside /home/dev/91ef15/app.
