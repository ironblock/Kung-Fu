I'm working on a small app in /home/dev/224faf/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Give the sender nothing in quiet hours

The sender asks `Outbox.due` in `src/notices.ts` every few minutes what it should send. Due times are kept clear of quiet hours when a notice is queued, so until now that was enough. But last week the sender was down for an evening. It came back at eleven at night and sent everything it had missed.

Please make the method give a new empty array whenever `now` falls in the outbox's own quiet hours, whatever is waiting and whatever the limit. Use the idea of quiet hours that the rest of the file has. I do not want a second one.

Outside quiet hours it must give exactly what it gives today, in the same order and with the same limit.

Nothing else about the outbox changes. A call in quiet hours alters no notice and records nothing.

Please keep every change inside /home/dev/224faf/app.
