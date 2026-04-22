Execute the SQL files in this folder manually on the target PostgreSQL server in filename order.

Current user-role migration:

1. Run [V2026_04_22_001__user_multi_roles.sql](./V2026_04_22_001__user_multi_roles.sql).
2. Restart the backend after the migration finishes.

This migration does three things:

- Creates `app_user_roles` if it does not exist.
- Copies existing values from `app_user.type` into `app_user_roles`.
- Drops the legacy `app_user.type` column and its old check constraint.
