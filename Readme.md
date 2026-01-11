# API Integration Test Suite

This repository contains **integration tests** for a backend server.

These tests are written to check whether important API endpoints are working
as expected when hit like a real client.

> ⚠️ Important:
>
> - This repo **does NOT start the backend**
> - The backend server must already be running
> - Tests will hit real HTTP endpoints

---

## What is tested in this repo?

This repo focuses mainly on **authentication-related APIs**.

### Signup (`POST /auth/signup`)

Signup tests cover things like:

- Creating a new user successfully
- Rejecting duplicate usernames
- Rejecting requests with missing fields
- Making sure passwords are **not leaked** in responses

Expected behavior:

- Successful signup → `201`
- Duplicate username → `409`
- Missing/invalid fields → `400`

---

### Login (`POST /auth/login`)

Login tests cover:

- Logging in with correct credentials
- Rejecting wrong passwords
- Rejecting non-existent users
- Rejecting requests with missing fields
- Ensuring JWT/token is returned **only on success**

Expected behavior:

- Successful login → `200`
- Wrong credentials → `401`
- Missing fields → `400`
- No token should ever be returned on failure

---

### Security checks

Some tests also check that:

- Internal errors are not leaked
- Passwords are never returned
- Tokens are only present on valid login
- Error responses are consistent

---

## Folder structure

```text
tests/
  ├─ auth.signup.test.js     # signup related tests
  ├─ auth.login.test.js      # login related tests
  ├─ auth.security.test.js   # basic security checks
  └─ helpers.js              # shared request helpers
```
