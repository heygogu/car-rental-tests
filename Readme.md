This repository contains integration-level tests for a running backend server. The goal is to validate API contracts (status codes, response shapes, error messages, and security behavior) in a way that closely mirrors real production usage.

These tests do not start the server. They assume the backend is already running and reachable via HTTP.

⸻

Purpose

The intent of this test suite is to:
• Verify that API endpoints behave exactly as documented
• Enforce consistent status codes and error messages
• Catch misconfigurations (auth, database, environment) early
• Act as a contract between backend implementation and clients

If tests fail, it means the backend violated an expected contract — not that the test is “too strict”.

⸻

How This Repo Works
• Tests are written using Vitest
• Requests are made using the native fetch API
• The backend server is assumed to be running already
• Tests hit real HTTP endpoints (no mocks, no in-memory injection)

This makes the tests closer to how real clients interact with the system.

⸻

Configuration

Server URL

The backend base URL is configured in one place:

/tests/helpers.js

const BASE_URL = "http://localhost:3000";

If your server runs on a different host or port, change it here. No environment variables are required for this test suite.

⸻

Expected API Conventions

To keep tests meaningful and consistent, backend code must follow these conventions.

1. Response Shape (Required)

All API responses must follow this structure:

{
"success": true | false,
"data": {
"message": "human readable message",
"...": "additional fields if needed"
}
}

Do not:
• Change field names
• Return raw primitives
• Mix error formats across endpoints

⸻

2. HTTP Status Codes

Use status codes semantically:
• 200 – Successful read or login
• 201 – Resource created successfully
• 400 – Validation error / bad input
• 401 – Authentication failure
• 403 – Authenticated but not authorized
• 404 – Resource not found
• 409 – Conflict (e.g. duplicate username)
• 500 – Internal server error

Do not return 200 for failures.
Do not overload 409 or 400 for unexpected crashes.

⸻

3. Error Messages Are Part of the Contract

Tests assert exact error messages. This is intentional.

Examples:
• "username already exists"
• "user does not exist"
• "incorrect password"
• "Internal server error"

If you change an error message, you must update the tests.

This prevents silent breaking changes for frontend or API consumers.

⸻

4. Never Leak Internal Errors

Responses must not expose:
• Stack traces
• Prisma errors
• Database details
• Library names (bcrypt, jwt, etc.)

All unexpected failures must return:

{
"success": false,
"data": {
"message": "Internal server error"
}
}

Internal errors should be logged on the server, not returned to clients.

⸻

5. Authentication Rules

For auth endpoints:
• Passwords must never be returned
• Tokens are returned only on successful login
• Invalid credentials must return 401
• Missing fields must return 400

Tests will explicitly check for these invariants.

⸻

Running the Tests

Ensure the backend server is running.

Then, from this repository:

npm install
npm test

Tests will immediately start sending requests to the configured BASE_URL.

⸻

Test Philosophy

These tests are intentionally strict.

They are designed to:
• Fail fast
• Expose hidden assumptions
• Prevent accidental API regressions

If a test fails, the correct response is:

“What contract did the backend violate?”

—not—

“How do I relax the test?”

⸻

When to Update Tests

Update tests when:
• API behavior is intentionally changed
• Error messages are intentionally revised
• New endpoints or flows are added

Do not update tests to hide bugs.

⸻

Final Note

This repository is not a tutorial.
It is a verification harness.

If all tests pass, consumers of the API can rely on its behavior with confidence.
