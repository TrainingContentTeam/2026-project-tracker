

# Course Production Tracker

A project management tool to track e-learning course production, seeded from your `Project_Inventory-Master.xlsx` file. Each course will have checkboxes for the 9 production stages you listed.

## What you'll get

**Dashboard (home page)**
- Header with overall stats: total courses, in progress, completed
- Filter bar: search by course name, filter by Quarter (Q1–Q4), Vertical (FireRescue, EMS, P1A, etc.), and status
- Sortable table of all courses with columns: Course Name, Quarter, Vertical, Due Date, Progress bar (X / 9 stages complete), Actions

**Course Detail Page**
- Course metadata (Quarter, Vertical, Date Assigned, Due Date, SME, Voice Over Artist, Tools, Comments)
- 9-stage checklist — each item shows a checkbox, who completed it, and date completed:
  1. SME
  2. Peer Review
  3. Legal Review / Policy Review
  4. Medical Review (Dr. Tan)
  5. CQO
  6. Outline
  7. Survey
  8. In Development
  9. Testing w/ Peer
- Notes field per stage (optional)
- Edit course metadata inline

**Add / Edit Course**
- Dialog form to add a new course or edit an existing one (name, quarter, vertical, dates, SMEs, comments)

**Data import**
- Your uploaded spreadsheet will be parsed and seeded into the database on first launch. Existing fields (Quarter, Course Name, Vertical, Date Assigned, SMEs, Voice Over Artist, Legal Review, Tools, Due Date, Comments) are imported. The 9 checkboxes start unchecked — you'll mark progress going forward. Where the spreadsheet's "Progress" column says "Completed" or similar, I'll pre-check the In Development + Testing stages as a best-effort starting point.

## Data model (Lovable Cloud)

`courses` table: id, name, quarter, vertical, date_assigned, due_date, sme, voice_over_artist, legal_review_contact, technical_tools, comments, lesson_plan, course_outline, uploaded_to_lms, created_at, updated_at

`course_stages` table: id, course_id, stage_name (enum of the 9), completed (bool), completed_at (timestamp), notes (text), unique(course_id, stage_name)

RLS: open read/write for now (single-user tool). Can add auth later if needed.

## Visual style

Clean, professional admin look — neutral background, subtle borders, generous spacing. Progress shown as a horizontal bar with "X of 9" label. Completed stages get a green check; pending stages a gray empty box. Mobile responsive (table collapses to cards on small screens).

## Out of scope (ask if you want any of these)

- User accounts / multi-user assignments
- Email/notification reminders for due dates
- Re-importing the spreadsheet later (one-time seed only)
- Export back to Excel
- Kanban or calendar view

