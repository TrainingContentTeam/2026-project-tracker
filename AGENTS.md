## Authentication
- Keep password recovery on a public `/reset-password` route and require a recovery session before updating a password; ordinary sign-in must not bypass recovery validation.