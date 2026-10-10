# Test Case Template

> Copy this block for each test case. All agents read and write test cases in this format.

---

## TC-<MODULE>-<NNN> — <Short descriptive title>

**Module:** <!-- e.g. Login, Payments, Dashboard -->
**Priority:** <!-- P0 | P1 | P2 | P3 -->
**Type:** <!-- Functional | UI | API | Security -->
**Role:** <!-- Which user role executes this test? e.g. Standard User, Admin -->

**Preconditions:**
<!-- What must be true before the test starts? -->
<!-- e.g. User is logged out. App is on the login page. -->

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | <!-- e.g. Navigate to /login --> | <!-- e.g. Login page is displayed with email and password fields --> |
| 2 | <!-- e.g. Enter valid email in the email field --> | <!-- e.g. Email is entered without error --> |
| 3 | <!-- e.g. Enter valid password in the password field --> | <!-- e.g. Password is masked with asterisks --> |
| 4 | <!-- e.g. Click the "Sign In" button --> | <!-- e.g. User is redirected to the dashboard --> |

**Expected Final State:**
<!-- What should be true after all steps complete successfully? -->
<!-- e.g. User is authenticated and sees the dashboard. Session cookie is set. -->

**Test Data:**
<!-- Any specific values needed: emails, passwords, amounts, IDs -->
<!-- e.g. Email: TEST_USER_EMAIL from .env -->

**Notes:**
<!-- Optional: known quirks, related tickets, dependencies on other tests -->

---
