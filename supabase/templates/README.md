# Signup confirmation email

Subject: **Confirm your email — PAP Scholars**

In Supabase, open **Authentication → Email → Templates → Confirm sign up**
(the labels may vary by dashboard version). Replace the message body with the entire
contents of `confirm-signup.html`, update the subject, and save. Local files alone do
not update hosted Supabase templates.

The template uses Supabase's `{{ .ConfirmationURL }}` variable and preserves the
existing confirmation flow. Keep the application's `/auth/callback` URL in the
redirect allow list and configure the production Site URL under URL Configuration.

The design uses inline styles, presentation tables, a fluid 560px container, system
fonts, and a text brand mark so it works without remote images. Email clients may
render rounded corners differently. Use Supabase's preview, then request a fresh
confirmation email and check both mobile and desktop inboxes. Check the confirmation
link on the same browser/device used for signup when using the existing PKCE flow.

Changing the sender from “Supabase Auth” to “PAP Scholars” is a separate setting:
configure custom SMTP and its sender name/address in Supabase. Editing this HTML
changes the email body, not the sender identity or delivery provider.
