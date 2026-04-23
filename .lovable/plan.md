

## Auto-open Outlook with prefilled email when "Outline" is checked

When you check off the **Outline** stage on a course, your computer's default mail client (Outlook) opens with a pre-filled draft addressed to that course's SME. You review it, edit if you want, and hit Send yourself. Nothing is sent automatically and no email service or domain setup is required.

### How it works

- Uses a `mailto:` link the browser hands off to Outlook (or whatever your default mail app is).
- Triggered only when Outline transitions from unchecked → checked.
- One-shot per session: a small confirmation toast appears so you know it fired.

### What you need on each course

A new **SME Email** field on the course (currently `sme` is just a name). I'll:
- Add `sme_email` (text, nullable) to the `courses` table.
- Add an "SME Email" input to the Add/Edit Course dialog.
- Show "SME Email" in the course Details panel.
- You backfill emails as you go — no bulk migration needed.

If a course has no `sme_email` when Outline is checked, you'll see a toast: *"Add an SME email to this course to auto-open the email."* The checkbox still works.

### Email template (prefilled)

- **To:** `course.sme_email`
- **Subject:** `Lexipol Course Feedback — {Course Name}`
- **Body:**
  ```
  Hi {SME Name},

  Thank you for all of your time, effort, and support on this project. We truly appreciate your expertise and the value you brought throughout the process.

  As we continue working to improve Lexipol's processes, we would appreciate your feedback. Please take a few minutes to complete this short survey:

  https://forms.office.com/Pages/ResponsePage.aspx?id=gQX_kISeMUqFbHGtfNW2zSJ9aE9hPwVMqhL-mFTtfOxUMDdSNTdPV1RHVDNPTktUWk5OTDlaUUpJUy4u

  Your input will help us refine our approach and make future projects even more effective.

  Thank you again for your partnership and support.

  Best,
  {Your Name}
  ```

`{SME Name}` comes from the course's `sme` field (first name parsed if it looks like "First Last"). `{Your Name}` comes from the signed-in user's email (you can edit before sending).

### Files changed

- **DB migration**: add `sme_email` column to `courses`.
- **`src/lib/courses.ts`**: add `sme_email` to the `Course` type.
- **`src/components/CourseFormDialog.tsx`**: add "SME Email" input.
- **`src/routes/courses.$courseId.tsx`**:
  - Show SME Email in Details panel.
  - In `toggleStage`, when `stage_name === "Outline"` and `completed === true`, build the `mailto:` URL and call `window.location.href = mailtoUrl` (or `window.open`).
  - Show toast confirming the draft opened, or warn if `sme_email` is missing.

### Notes / limits

- The user's machine must have Outlook (or another mail app) set as the default `mailto:` handler. On Windows with Outlook installed this is the default.
- Very long `mailto:` bodies can be truncated by some clients; this body is well under that limit.
- No emails leave your app — Outlook handles delivery.
- Easy to extend later to other stages (e.g. Published) if you want.

