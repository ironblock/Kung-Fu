I'm working on a small app in /home/dev/3aa0e5/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# End the report with the latest events

When I print a handover's report I also want to see what happened last. Please change `Handover.report` in `src/handover.ts`.

After the lines it gives now, the report gets one more line for each of the three events that were added to the timeline last. The event added last comes first, then the one added before it, then the one before that. Each line is the event as `describeEvent` writes it.

This goes by when an event was added, not by the time written on it: a gauge reading is often entered after ticks that carry a later time.

A handover with fewer than three events gets a line for each event it has, and one with no events gets no more lines. The lines the report gives now stay exactly as they are.

Please keep every change inside /home/dev/3aa0e5/app.
