I'm working on a small app in /home/dev/825f4e/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Five minor findings should count as a major one

In `src/survey.ts`, `outcomeOf` takes no account of minor findings, however many a survey has. Our insurer no longer accepts that, so I want it changed: when a survey has five or more minor findings, together they count as one major finding, on top of the major findings that function counts now, in each of its rules about major findings. So five minor findings and nothing worse make a survey conditional, where today it passes. Ten minor findings still count as one major finding, not two. A waived minor finding does not count towards the five, and advisories are not counted with the minors. Four minor findings or fewer change nothing.

Please keep every change inside /home/dev/825f4e/app.

You cannot open files or run anything from where you are. All you have of the file is its path: app/src/survey.ts.

Reply with your change as edits. Each edit is a line 'EDIT: app/<path>' followed by one fenced block of this form:

```
<<<<<<< SEARCH
text that is in the file now, copied exactly
=======
the text to put in its place
>>>>>>> REPLACE
```

The SEARCH text must be found in the file exactly once, or that edit is refused. The edits are applied in the order you give them. An edit with nothing between SEARCH and ======= adds its text at the end of the file. To write a whole file instead, give a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the edits, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
