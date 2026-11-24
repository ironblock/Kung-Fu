I'm working on a small app in /home/dev/c934e4/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Say how much cover is left on the certificate line

In `src/survey.ts`, `certificateLine` names a certificate that has started, but it does not say how long that certificate has to run. I want the line for a started certificate to end with the number of days on which the boat may still go out on it, counting today when the boat may go out today: `, 12 days left`, or `, 1 day left`. When the boat may no longer go out on that certificate today, the line ends with `, lapsed` instead.

So a line reads `Heron: certificate SC-HERON-01000, 12 days left`, or `Heron: certificate SC-HERON-01000, lapsed`. The line for an interim certificate gets the same ending. The lines for no certificate, and for a certificate that has not started yet, stay as they are.

Please keep every change inside /home/dev/c934e4/app.
