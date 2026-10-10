<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep family state in the root FamilyProvider and share it across file-based Turkish routes, so navigation retains live family context.
- Store durable family records and audit history in Cloud with membership-scoped RLS; sample family data is isolated in memory and never written to real families.
- Store parent roles and edit/view permissions in user_roles, separate from user-editable profiles, to prevent privilege escalation.
- Use manifest-only installation without an app-shell service worker; reminders currently run while the application is open.
- Use database triggers for immutable event audit entries and recurrence expansion in the calendar domain helper.
