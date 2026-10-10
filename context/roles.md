# Roles & Permissions

> Fill in this file with your application's user roles.
> Agents use this to know which credentials to use and what to expect for each role.

## Roles

### Admin
**Description:** Full access to all modules and settings.
**Key permissions:**
- Can create, edit, delete all records
- Can manage users and roles
- Can access billing and settings

**Env variable for credentials:**
- Email: `ADMIN_EMAIL`
- Password: `ADMIN_PASSWORD`

---

### Standard User
**Description:** Regular authenticated user.
**Key permissions:**
- Can view and edit own records
- Cannot access admin settings
- Cannot manage other users

**Env variable for credentials:**
- Email: `TEST_USER_EMAIL`
- Password: `TEST_USER_PASSWORD`

---

<!-- Add more roles as needed. Copy the block above. -->

## Modules & Role Access Matrix

| Module | Admin | Standard User | Guest |
|--------|-------|---------------|-------|
| Login | ✓ | ✓ | ✓ |
| Dashboard | ✓ | ✓ | ✗ |
| Settings | ✓ | partial | ✗ |
| <!-- module --> | | | |

## Notes

<!-- Any special access rules, time-based permissions, feature flags per role, etc. -->
