# Module: Login / Authentication

> Fill in this file with domain knowledge about the login feature.
> Agents read this to understand how login works before generating or executing tests.

## Overview

<!-- What does this module do? Who uses it? -->

## Login Flow

1. User navigates to `/login` (or equivalent)
2. Enters email and password
3. Submits the form
4. On success: redirected to <!-- dashboard / home / etc. -->
5. On failure: error message shown inline

## Key Selectors (if known)

| Element | Selector |
|---------|---------|
| Email field | `[data-testid="email-input"]` or `<!-- update -->` |
| Password field | `[data-testid="password-input"]` or `<!-- update -->` |
| Submit button | `[data-testid="login-btn"]` or `<!-- update -->` |
| Error message | `[data-testid="login-error"]` or `<!-- update -->` |

## Auth Method

<!-- Cookie session / JWT token / OAuth / SSO — how does auth work? -->

## Known Behaviors

- <!-- e.g. Account locks after 5 failed attempts -->
- <!-- e.g. Session expires after 30 minutes of inactivity -->
- <!-- e.g. "Remember me" extends session to 30 days -->

## Test Data Notes

- Use credentials from `.env` (`TEST_USER_EMAIL`, `TEST_USER_PASSWORD`)
- Do not use production accounts
- <!-- any specific test accounts or states needed -->

## Edge Cases to Always Test

- Login with unregistered email
- Login with correct email but wrong password
- Login with empty fields
- Login after account is locked / deactivated
