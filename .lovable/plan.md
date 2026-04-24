Goal: make the dashboard display date-only fields exactly as stored so the sexual harassment courses show May 11 as the start date and August 14 as the due date.

Plan

1. Fix date-only rendering in the shared formatter
- Update `src/lib/courses.ts` so `formatDate` does not use `new Date("YYYY-MM-DD")` directly.
- Parse date-only strings as local calendar dates instead of UTC midnight.
- Keep existing behavior for full timestamps like `completed_at`.

2. Apply the fix everywhere the dashboard and detail page already use the formatter
- The main dashboard in `src/routes/index.tsx` already uses `formatDate(c.start_date)` and `formatDate(c.due_date)`.
- The course detail route in `src/routes/courses.$courseId.tsx` also uses the same formatter, so fixing the shared helper will correct both places.

3. Verify against the actual stored course data
- The database already contains the expected values for the sexual harassment courses:
  - `start_date = 2026-05-11`
  - `due_date = 2026-08-14`
- After the formatter change, those should render as May 11, 2026 and Aug 14, 2026 instead of one day earlier.

What I found
- The database values are already correct.
- The bug is in frontend rendering only.
- Current `src/lib/courses.ts` still has:
  `new Date(d).toLocaleDateString(...)`
  which interprets `YYYY-MM-DD` as UTC and can shift the date backward by one day depending on timezone.

Technical details
- Intended implementation:
```ts
export function formatDate(d: string | null | undefined): string {
  if (!d) return "—";

  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  const date = m
    ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    : new Date(d);

  try {
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return d;
  }
}
```
- This preserves correct display for true date-only columns while still formatting timestamps.

Success criteria
- On the main dashboard, the sexual harassment courses show:
  - Start: May 11, 2026
  - Due: Aug 14, 2026
- The course detail page shows the same corrected dates.
- No database changes are needed.