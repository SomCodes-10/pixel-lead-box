# LeadDesk Mini

A lead-capture app with a public form and an authenticated admin dashboard.

**Live URLs**
- Public site: https://pixel-lead-box.lovable.app/
- Admin: https://pixel-lead-box.lovable.app/admin
- Test credentials: `<ADMIN_EMAIL>` / `<ADMIN_PASSWORD>` — [fill in the account you created]

---

## Stack

- **Frontend**: React (built with Lovable)
- **Backend / DB**: Supabase (Postgres + Auth + Row Level Security)
- **Hosting**: Lovable (frontend), Supabase (backend/DB) — both on free tier

---

## Data model

**`leads`** — one row per form submission
| column | type | notes |
|---|---|---|
| id | uuid | primary key |
| name | text | required |
| email | text | required, validated client + server side |
| budget_range | text | one of: `<$1k`, `$1k-$5k`, `$5k-$20k`, `$20k+` |
| message | text | required, min 10 chars |
| status | text | `New` / `Contacted` / `Closed`, defaults to `New` |
| created_at | timestamp | defaults to `now()` |

**`user_roles`** — separate table mapping users to roles
| column | type | notes |
|---|---|---|
| user_id | uuid | references `auth.users.id` |
| role | text | `admin` for authorized dashboard users |

Roles are kept in a separate table rather than a column on `auth.users` directly. This is the standard Supabase pattern for RLS: it lets policies check role membership through a `security definer` lookup function instead of querying `auth.users` from inside a policy, which avoids RLS recursion issues.

---

## Auth approach

- **Public form**: unauthenticated visitors can `INSERT` into `leads` — no login required to submit a lead.
- **Admin dashboard** (`/admin`): protected route. No session → redirect to `/login`. Session handled entirely by Supabase Auth (email/password), not custom tokens or hardcoded credentials.
- **Row Level Security** on `leads`: `SELECT` and `UPDATE` are restricted to authenticated users who have an `admin` row in `user_roles`. This means the row-level check happens at the database layer, not just hidden in the frontend — a signed-in non-admin user (if one existed) still couldn't read leads via the API directly.
- **Session lifecycle**: persists across page refresh, cleared on logout via the "Log out" button, which ends the Supabase session and redirects back to `/login`.

---

## Setup note

New admin users need one manual step after creation in Supabase Auth: insert a row into `user_roles` with their `user_id` and `role = 'admin'`. Without it, login succeeds but the dashboard shows zero leads, since RLS filters everything out for a user with no recognized role.
 
