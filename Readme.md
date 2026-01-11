# API Integration Test Suite

This repository contains **integration tests** for a backend server that handles authentication and booking management for a car rental system.

The tests are written to check whether important API endpoints are behaving correctly when hit like a real client.

> ⚠️ **Important:**
>
> - This repo **does NOT start the backend**
> - The backend server must already be running
> - Tests hit real HTTP endpoints

---

## What is tested in this repo?

This repo focuses on two main areas:

1. **Authentication APIs** (signup, login)
2. **Booking Management APIs** (create, read, update, delete bookings)

---

# To see how I have implemented the assignment check

    - [github](https://github.com/heygogu/car-rental)

Setup Instructions
Prerequisites

Node.js installed on your machine
Backend server running (this test suite doesn't start it)

Installation

Clone this repository:

bash git clone <your-repo-url>
cd <repo-name>

Install dependencies:

`npm install`

Configure the backend URL:

Update the configuration in `helpers.js`
Set the base URL to your running backend server

BASE_URL=http://localhost:3000
Running the Tests

Make sure your backend server is running
Run all tests:

` npm test`

Run specific test files:

`npm test auth.signup.test.js`
`npm test bookings.create.test.js`

Run tests in watch mode:

`npm test --watch`

## 🔐 Authentication APIs

### Signup (`POST /auth/signup`)

Signup tests cover:

- Creating a new user successfully
- Rejecting duplicate usernames
- Rejecting requests with missing or invalid fields
- Making sure passwords are **never leaked** in responses

#### Expected behavior

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

### Login (`POST /auth/login`)

Login tests cover:

- Logging in with correct credentials
- Rejecting wrong passwords
- Rejecting non-existent users
- Rejecting requests with missing fields
- Ensuring token is returned **only on success**

#### Expected behavior

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

## 🚗 Booking Management APIs

All booking endpoints require authentication via JWT token in the Authorization header.

### Create Booking (`POST /bookings`)

Creates a new car rental booking for the authenticated user.

#### Request Body

```json
{
  "carName": "BMW",
  "days": 3,
  "rentPerDay": 1000
}
```

#### Tests cover:

- Creating a booking successfully with valid data
- Calculating total cost correctly (`days * rentPerDay`)
- Rejecting requests without authentication token
- Rejecting invalid input (empty car name, missing fields)
- Enforcing business rules:
  - `days` must be between 1 and 365
  - `rentPerDay` must be greater than 0
  - `carName` cannot be empty
- Strict schema validation (rejecting extra fields)
- All new bookings created with status `"Booked"`

#### Expected behavior

| Scenario                   | Status Code | Notes                            |
| -------------------------- | ----------- | -------------------------------- |
| Successful creation        | `201`       | Returns `bookingId`, `totalCost` |
| Missing authentication     | `401`       | No token provided                |
| Invalid fields             | `400`       | Validation error                 |
| Days > 365                 | `400`       | Business rule violation          |
| RentPerDay = 0 or negative | `400`       | Business rule violation          |
| Empty carName              | `400`       | Validation error                 |
| Extra fields in body       | `400`       | Strict schema enforcement        |

---

### Get Bookings (`GET /bookings`)

Retrieves booking information for the authenticated user. This endpoint supports three modes via query parameters.

#### Mode 1: Get all user bookings (no query params)

```
GET /bookings
```

Returns an array of all bookings for the current user, ordered by creation date (newest first).

#### Mode 2: Get specific booking by ID

```
GET /bookings?bookingId=abc123
```

Returns a single booking object if it belongs to the authenticated user.

#### Mode 3: Get booking summary

```
GET /bookings?summary=true
```

Returns aggregated statistics for the user's bookings.

**Response format:**

```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "username": "john_doe",
    "totalBookings": 5,
    "totalAmountSpend": 15000
  }
}
```

> **Note on summary calculation:**  
> The tests assume that the summary endpoint only counts bookings with status `"Booked"` or `"Completed"` when calculating `totalBookings` and `totalAmountSpend`. This is based on the backend implementation where cancelled or pending bookings might exist but shouldn't be included in spending totals.

#### Tests cover:

- Returning all bookings for a user
- Returning a specific booking by ID
- Returning summary with correct calculations
- Preventing simultaneous use of `summary` and `bookingId` parameters
- Returning empty array when user has no bookings
- Preventing users from accessing other users' bookings
- Returning zero values in summary when no bookings exist

#### Expected behavior

| Scenario                           | Status Code | Notes                         |
| ---------------------------------- | ----------- | ----------------------------- |
| Get all bookings                   | `200`       | Returns array of bookings     |
| Get booking by ID (exists)         | `200`       | Returns single booking object |
| Get booking by ID (doesn't exist)  | `404`       | Booking not found             |
| Get booking owned by another user  | `404`       | Authorization check           |
| Get summary                        | `200`       | Returns aggregated stats      |
| Use both `summary` and `bookingId` | `400`       | Conflicting parameters        |
| No bookings exist                  | `200`       | Returns empty array or zeros  |

---

### Update Booking (`PUT /bookings/:id`)

Updates an existing booking. Users can update `days`, `rentPerDay`, or both.

#### Request Body (partial update allowed)

```json
{
  "days": 5,
  "rentPerDay": 800
}
```

#### Tests cover:

- Updating booking fields successfully
- Allowing partial updates (only `days` or only `rentPerDay`)
- Preventing users from updating other users' bookings
- Requiring authentication
- Rejecting empty request body
- Updating total cost automatically

#### Expected behavior

| Scenario                      | Status Code | Notes                     |
| ----------------------------- | ----------- | ------------------------- |
| Successful update             | `200`       | Returns updated booking   |
| Update another user's booking | `403`       | Forbidden                 |
| No authentication token       | `401`       | Unauthorized              |
| Empty request body            | `400`       | At least one field needed |
| Booking doesn't exist         | `404`       | Not found                 |

---

### Delete Booking (`DELETE /bookings/:id`)

Deletes a booking by ID.

#### Tests cover:

- Deleting a booking successfully
- Requiring authentication
- Preventing deletion of non-existent bookings
- Preventing double deletion

#### Expected behavior

| Scenario                    | Status Code | Notes           |
| --------------------------- | ----------- | --------------- |
| Successful deletion         | `200`       | Booking deleted |
| No authentication token     | `401`       | Unauthorized    |
| Booking doesn't exist       | `404`       | Not found       |
| Deleting same booking twice | `404`       | Already deleted |

---

## Error Messages Expected by Tests

Some tests assert exact error messages. Backend should return these messages for corresponding cases.

### Signup

- `"username already exists"`
- `"Internal server error"` (for unexpected failures)

### Login

- `"user does not exist"`
- `"incorrect password"`
- `"Internal server error"` (for unexpected failures)

### Bookings

- `"Cannot use summary and bookingId together"`
- `"bookingId not found"`

Validation-related errors can return any reasonable message, but must use the correct status code (`400`).

---

## General Error Rules

- Validation errors → `400`
- Authentication failures → `401`
- Authorization failures (accessing other user's data) → `403`
- Resource not found → `404`
- Conflicts (duplicate data) → `409`
- Server crashes / unexpected issues → `500`
- Internal errors must **not** leak stack traces, DB errors, or library names

---

## Folder Structure

```text
tests/
  ├─ auth/
  │   ├─ auth.signup.test.js      # signup related tests
  │   ├─ auth.login.test.js       # login related tests
  │   └─ auth.security.test.js    # basic security checks
  ├─ bookings/
  │   ├─ bookings.create.test.js  # POST /bookings tests
  │   ├─ bookings.get.test.js     # GET /bookings tests
  │   └─ bookings.crud.test.js    # PUT & DELETE tests
  └─ helpers.js                    # shared HTTP helpers
```

---

## Running the Tests

1. Make sure your backend server is running
2. Configure the base URL in your test environment
3. Run tests:
   `npm test`

---

## Test Assumptions

These tests are written based on certain backend implementation assumptions:

1. **Booking Summary Calculation:**  
   The `GET /bookings?summary=true` endpoint is assumed to only count bookings with status `"Booked"` or `"Completed"` when calculating totals. This means cancelled, pending, or other status bookings are excluded from the spending summary.

2. **Status Field:**  
   All newly created bookings are assumed to have a default status of `"Booked"`.

3. **Authentication:**  
   All booking endpoints require a valid JWT token in the Authorization header.

4. **User Isolation:**  
   Users can only access, modify, or delete their own bookings. Attempting to access another user's booking results in a `404` (not `403`) to avoid leaking information about booking existence.

---

## Security Notes

- Passwords are never returned in any API response
- Authentication tokens are only provided on successful login
- Users cannot access or modify other users' bookings
- Strict input validation prevents injection attacks
- Schema validation rejects unexpected fields

---

## Contributing

When adding new tests:

1. Follow the existing test structure
2. Use descriptive test names
3. Test both success and failure cases
4. Verify status codes and response structure
5. Update this README with new endpoint documentation
