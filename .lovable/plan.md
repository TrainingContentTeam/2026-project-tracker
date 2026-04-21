

## Add green checkmark to completed courses

A green `CheckCircle2` icon will appear next to the course name on the dashboard whenever all 11 production stages are complete (i.e. `progress.done === progress.total`).

### Where it appears
- **Desktop table** (`src/routes/index.tsx`): inline next to the course name link in the "Course Name" column.
- **Mobile card view** (`src/routes/index.tsx`): inline next to the course name at the top of each card.

### Visual
- Icon: `CheckCircle2` from `lucide-react` (already imported).
- Color: `text-success` (matches the existing "Completed" stat card styling).
- Size: `h-4 w-4`, with a small left margin.
- Includes `aria-label="Completed"` for accessibility.

### Files changed
- `src/routes/index.tsx` — add the conditional checkmark in both the desktop table row and the mobile card.

No other files, database changes, or new dependencies needed.

