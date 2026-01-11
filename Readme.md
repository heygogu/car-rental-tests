# API Integration Test Suite

This repository contains **integration tests** for a backend server.

The tests are written to check whether important API endpoints are behaving
correctly when hit like a real client.

> ⚠️ Important:
>
> - This repo **does NOT start the backend**
> - The backend server must already be running
> - Tests hit real HTTP endpoints

---

## What is tested in this repo?

This repo mainly focuses on **authentication-related APIs**.

---

## Signup (`POST /auth/signup`)

Signup tests cover:

- Creating a new user successfully
- Rejecting duplicate usernames
- Rejecting requests with missing or invalid fields
- Making sure passwords are **never leaked** in responses

### Expected behavior

| Scenario                | Status Code | Notes                  |
| ----------------------- | ----------- | ---------------------- |
| Successful signup       | `201`       | Returns `userId`       |
| Username already exists | `409`       | Error message expected |
| Missing username        | `400`       | Validation error       |
| Missing password        | `400`       | Validation error       |
| Invalid request body    | `400`       | Validation error       |
| Unexpected server error | `500`       | Generic error message  |

Password must **never** be returned in any signup response.

---

## Login (`POST /auth/login`)

Login tests cover:

- Logging in with correct credentials
- Rejecting wrong passwords
- Rejecting non-existent users
- Rejecting requests with missing fields
- Ensuring token is returned **only on success**

### Expected behavior

| Scenario                | Status Code | Notes                  |
| ----------------------- | ----------- | ---------------------- |
| Successful login        | `200`       | Token must be returned |
| User does not exist     | `401`       | No token               |
| Incorrect password      | `401`       | No token               |
| Missing username        | `400`       | Validation error       |
| Missing password        | `400`       | Validation error       |
| Invalid request body    | `400`       | Validation error       |
| Unexpected server error | `500`       | Generic error message  |

Token must **never** be present in error responses.

---

## Error messages expected by tests

Some tests assert exact error messages.
Backend should return these messages for corresponding cases.

### Signup

- `"username already exists"`
- `"Internal server error"` (for unexpected failures)

### Login

- `"user does not exist"`
- `"incorrect password"`
- `"Internal server error"` (for unexpected failures)

Validation-related errors can return any reasonable message,  
but must use the correct status code (`400`).

---

## General error rules

- Validation errors → `400`
- Authentication failures → `401`
- Conflicts (duplicate data) → `409`
- Server crashes / unexpected issues → `500`
- Internal errors must **not** leak stack traces, DB errors, or library names

---

## Folder structure

```text
tests/
  ├─ auth.signup.test.js     # signup related tests
  ├─ auth.login.test.js      # login related tests
  ├─ auth.security.test.js   # basic security checks
  └─ helpers.js              # shared HTTP helpers
```
