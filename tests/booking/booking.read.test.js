import { describe, it, expect } from "vitest";
import { post, get, createUserAndGetToken } from "../helpers";

describe("GET /bookings", () => {
  it("returns all bookings for user", async () => {
    const { token } = await createUserAndGetToken();

    await post(
      "/bookings",
      { carName: "BMW", days: 2, rentPerDay: 500 },
      token
    );
    await post(
      "/bookings",
      { carName: "Audi", days: 1, rentPerDay: 700 },
      token
    );

    const res = await get("/bookings", token);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data.data)).toBe(true);
  });

  it("returns booking by bookingId", async () => {
    const { token } = await createUserAndGetToken();

    const create = await post(
      "/bookings",
      { carName: "BMW", days: 2, rentPerDay: 500 },
      token
    );

    const bookingId = create.data.data.bookingId;

    const res = await get(`/bookings?bookingId=${bookingId}`, token);

    expect(res.status).toBe(200);
    expect(res.data.data.id).toBe(bookingId);
  });

  it("fails when summary and bookingId together", async () => {
    const { token } = await createUserAndGetToken();

    const res = await get("/bookings?summary=true&bookingId=123", token);

    expect(res.status).toBe(400);
  });

  it("returns empty array when user has no bookings", async () => {
    const { token } = await createUserAndGetToken();

    const res = await get("/bookings", token);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data.data)).toBe(true);
    expect(res.data.data.length).toBe(0);
  });

  it("does not allow reading another user's booking", async () => {
    const u1 = await createUserAndGetToken();
    const u2 = await createUserAndGetToken();

    const create = await post(
      "/bookings",
      { carName: "BMW", days: 2, rentPerDay: 500 },
      u1.token
    );

    const res = await get(
      `/bookings?bookingId=${create.data.data.bookingId}`,
      u2.token
    );

    expect(res.status).toBe(404);
  });

  it("summary returns zero when no bookings exist", async () => {
    const { token } = await createUserAndGetToken();

    const res = await get("/bookings?summary=true", token);

    expect(res.status).toBe(200);
    expect(res.data.data.totalBookings).toBe(0);
    expect(res.data.data.totalAmountSpend).toBe(0);
  });
});
