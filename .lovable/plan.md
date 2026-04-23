
Goal: get the live tracker reachable without login.

Plan

1. Publish the current frontend again
- The codebase already contains the public read-only changes:
  - `/` is marked public in `src/components/AuthGate.tsx`
  - guest users can view the dashboard in `src/routes/index.tsx`
  - guest users can view course details in `src/routes/courses.$courseId.tsx`
- However, the live published URL is still serving the old sign-in page, which means the latest frontend bundle has not gone live yet.

2. Re-verify live visibility settings
- Keep publish visibility set to public.
- Confirm the published deployment is attached to `https://progress-tracker-2026.lovable.app`.

3. Re-test the live URL after publish
- Check that the published homepage opens to the dashboard instead of `/login`.
- Check that a course detail page also opens without authentication.
- Confirm guests cannot edit, while signed-in users still can.

4. If the custom published URL still fails for the user specifically
- Test the stable production URL for the same app as a fallback.
- If the stable URL works but the named published URL does not, treat it as a hosting/DNS issue rather than an app code issue.
- In that case, keep the app code unchanged and resolve it at the publishing/domain layer.

What I expect to change
- No new code changes should be needed unless the live deployment still ignores the current auth-gating logic after republishing.
- If republishing does not fix it, the next code-level check would be whether any client redirect is forcing `/login` before session state settles, but the current `AuthGate` logic already allows `/` and `/courses/*` publicly.

Technical details
- Current code already allows public viewing:
  - `src/components/AuthGate.tsx`:
    - public routes include `/` and `/courses/*`
  - `src/routes/index.tsx`:
    - guests see “Sign in to edit” instead of edit controls
  - `src/routes/courses.$courseId.tsx`:
    - guests can view details and stages, but edit controls are gated
- Current live behavior mismatch:
  - published URL is public at the hosting level
  - fetched published page still shows the login screen
  - that mismatch points to an out-of-date published frontend, not a missing code change

Success criteria
- Opening `https://progress-tracker-2026.lovable.app` shows the course dashboard for signed-out visitors
- Opening any `/courses/:courseId` page works without login
- Add/edit/delete actions remain restricted to signed-in users
