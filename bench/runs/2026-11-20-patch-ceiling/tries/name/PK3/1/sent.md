I'm working on a small app in /home/dev/1b54b5/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Say how much cover is left on the certificate line

In `src/survey.ts`, `certificateLine` names a certificate that has started, but it does not say how long that certificate has to run. I want the line for a started certificate to end with the number of days on which the boat may still go out on it, counting today when the boat may go out today: `, 12 days left`, or `, 1 day left`. When the boat may no longer go out on that certificate today, the line ends with `, lapsed` instead.

So a line reads `Heron: certificate SC-HERON-01000, 12 days left`, or `Heron: certificate SC-HERON-01000, lapsed`. The line for an interim certificate gets the same ending. The lines for no certificate, and for a certificate that has not started yet, stay as they are.

Please keep every change inside /home/dev/1b54b5/app.

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
