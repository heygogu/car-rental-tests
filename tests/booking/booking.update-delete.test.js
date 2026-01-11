import { describe, it, expect } from "vitest";
import { post, put, del, createUserAndGetToken } from "../helpers";

describe("PUT /bookings/:id", () => {
  it("updates booking", async () => {
    const { token } = await createUserAndGetToken();

    const create = await post(
      "/bookings",
      { carName: "BMW", days: 2, rentPerDay: 500 },
      token
    );

    const id = create.data.data.bookingId;

    const res = await put(`/bookings/${id}`, { days: 5 }, token);

    expect(res.status).toBe(200);
    expect(res.data.data.booking.days).toBe(5);
  });

  it("fails updating other user's booking", async () => {
    const u1 = await createUserAndGetToken();
    const u2 = await createUserAndGetToken();

    const create = await post(
      "/bookings",
      { carName: "BMW", days: 2, rentPerDay: 500 },
      u1.token
    );

    const res = await put(
      `/bookings/${create.data.data.bookingId}`,
      { days: 10 },
      u2.token
    );

    expect(res.status).toBe(403);
  });

  it("fails updating booking without token", async () => {
    const { token } = await createUserAndGetToken();

    const create = await post(
      "/bookings",
      { carName: "BMW", days: 2, rentPerDay: 500 },
      token
    );

    const res = await put(`/bookings/${create.data.data.bookingId}`, {
      days: 10,
    });

    expect(res.status).toBe(401);
  });

  it("fails updating booking with empty body", async () => {
    const { token } = await createUserAndGetToken();

    const create = await post(
      "/bookings",
      { carName: "BMW", days: 2, rentPerDay: 500 },
      token
    );

    const res = await put(`/bookings/${create.data.data.bookingId}`, {}, token);

    expect(res.status).toBe(400);
  });

  it("allows updating only rentPerDay", async () => {
    const { token } = await createUserAndGetToken();

    const create = await post(
      "/bookings",
      { carName: "BMW", days: 2, rentPerDay: 500 },
      token
    );

    const res = await put(
      `/bookings/${create.data.data.bookingId}`,
      { rentPerDay: 800 },
      token
    );

    expect(res.status).toBe(200);
    expect(res.data.data.booking.rent_per_day).toBe(800);
  });
});

describe("DELETE /bookings/:id", () => {
  it("deletes booking", async () => {
    const { token } = await createUserAndGetToken();

    const create = await post(
      "/bookings",
      { carName: "BMW", days: 2, rentPerDay: 500 },
      token
    );

    const res = await del(`/bookings/${create.data.data.bookingId}`, token);

    expect(res.status).toBe(200);
  });
  it("fails deleting booking without token", async () => {
    const { token } = await createUserAndGetToken();

    const create = await post(
      "/bookings",
      { carName: "BMW", days: 2, rentPerDay: 500 },
      token
    );

    const res = await del(`/bookings/${create.data.data.bookingId}`);

    expect(res.status).toBe(401);
  });

  it("fails deleting same booking twice", async () => {
    const { token } = await createUserAndGetToken();

    const create = await post(
      "/bookings",
      { carName: "BMW", days: 2, rentPerDay: 500 },
      token
    );

    await del(`/bookings/${create.data.data.bookingId}`, token);

    const res = await del(`/bookings/${create.data.data.bookingId}`, token);

    expect(res.status).toBe(404);
  });
});
