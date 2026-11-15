# TaskFlow – Test Cases

**How these were run (15 Nov 2026):** T01–T17 and T19 were run automatically by a script that loads the real `index.html` and `script.js` into a simulated browser (jsdom) and clicks, types and reloads like a user. Results are in the Actual result column. This checks the logic, but it is not a real browser.

**Run by hand:** T18 and T20 check how the page looks and fits the screen, so they were checked manually in a real browser at mobile width.

| ID | Scenario | Steps / preconditions | Expected result | Actual result | Status |
|----|----------|-----------------------|-----------------|---------------|--------|
| T01 | Create several tasks | Add 3 tasks with different priorities and dates | All appear in the list; stats update | 3 tasks listed; Total=3, Pending=3 | Pass |
| T02 | Validation | Submit empty title; title "ab"; no due date; past due date | Inline error for each; nothing saved | Errors shown: "Enter a title for the task." / "Title needs at least 3 characters." / "Choose a valid due date." / "Due date cannot be in the past."; list stays at 3 | Pass |
| T03 | Edit task | Edit title, priority and due date | Changes shown and saved; creation date unchanged | Form pre-filled; row now "Task A2", Low priority, due 2026-11-19; creation date "Added 15 Nov 2026" unchanged; saved to storage | Pass |
| T04 | Edit to a past date | Edit a task and set a past due date | Saved; task shows "Overdue" | Past date accepted on edit; row shows "1 day late"; Overdue count=1 | Pass |
| T05 | Cancel delete | Delete, then press "Keep task" | Task remains | Confirm dialog opened, then closed with Keep task; 3 tasks remain | Pass |
| T06 | Confirm delete | Delete, then press "Delete task" | Task removed; stats update | Task C removed; Total=2; removed from storage | Pass |
| T07 | Complete / reopen | Click the circle twice | Completed styling, then back to pending; counts change | Completed (Completed=1), then reopened (Completed=0) | Pass |
| T08 | Search case | Search "REPORT", "report", "Report" | Same results each time | "REPORT", "report", "Report" all returned: ["Report draft"] | Pass |
| T09 | Search description | Search a word only in a description | Matching task shown | Search "zebra" (description only) returned ["Buy milk"] | Pass |
| T10 | Combined filters | Search + priority High + status Pending | Only tasks matching all three | Search "report" + High + Pending returned ["Report draft"] | Pass |
| T11 | Sort ties | Sort by priority with equal priorities | Ties ordered by due date, then title | Order with equal priority: ["a item","z item","b item"] | Pass |
| T12 | Overdue | Pending task with past due date | Red marker, "Overdue" tag, counted in Overdue | Pending past-due task shows "2 days late"; completed past-due task has no tag; Overdue=1 | Pass |
| T13 | Status menu filter | Click "Overdue" in the left menu (top menu on mobile) | Only overdue tasks shown; menu item highlighted | Overdue menu item selected; list shows ["Late one"] | Pass |
| T14 | Persistence | Add/edit tasks, refresh page | Tasks and completion state remain | After reload: ["Persist me"], completion state kept | Pass |
| T15 | Corrupted storage | In DevTools set `taskflow.tasks.v1` to `{bad` and reload | App loads empty with a notice; backup key exists; a second reload shows no notice | Empty list; notice "Saved tasks were unreadable. A backup copy was kept in your browser."; backup holds "{bad"; second reload notice: "" | Pass |
| T16 | Partly bad data | Set value to `[{"title":"Ok"},{"x":1}]` and reload | "Ok" task loads with defaults; one skipped; backup kept; storage now holds the repaired list and a second reload shows no notice | "Ok" loaded with defaults; notice "1 unreadable task was skipped. A backup copy was kept."; backup kept; storage repaired; second reload notice: "" | Pass |
| T17 | Storage blocked | Block site data in browser settings, reload | App works; notice says tasks won't persist | App rendered; notice "Browser storage is unavailable. Tasks will be lost when you close this tab."; adding a task still worked (3 to 4) | Pass |
| T18 | Mobile layout | DevTools at 375×667 and 768×1024 | No horizontal scroll; page fits screen; list scrolls inside | Checked manually in a browser at mobile width: no sideways scroll, page fits the screen, only the task list scrolls | Pass |
| T19 | Empty states | Delete all tasks; then search for nonsense | "Nothing here yet", then "No matching tasks" | No tasks: "Nothing here yetAdd ..."; no search match: "No matching tasksTry a..." | Pass |
| T20 | Mobile add / edit | At 375px width tap +, add a task; tap Edit on a task; tap Close | Bottom sheet opens and closes; edit pre-fills the form | Checked manually in a browser at mobile width: + opens the bottom sheet, Edit pre-fills the form, Close dismisses it | Pass |