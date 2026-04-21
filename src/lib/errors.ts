export function friendlyError(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (import.meta.env.DEV) {
    console.error(err);
  }
  // Map a few common Postgres error codes for better UX without leaking internals
  const code = (err as { code?: string } | null)?.code;
  if (code === "23505") return "A record with that name already exists.";
  if (code === "23503") return "This action references missing related data.";
  if (code === "PGRST301" || code === "42501") return "You don't have permission to do that.";
  return fallback;
}