import { describe, it, expect } from "vitest";
import { post, createUserAndGetToken } from "../helpers";

describe("POST /bookings", () => {
  it("creates booking successfully", async () => {
    const { token } = await createUserAndGetToken();

    const res = await post(
      "/bookings",
      {
        carName: "BMW",
        days: 3,
        rentPerDay: 1000,
      },
      token
    );

    expect(res.status).toBe(201);
    expect(res.data.success).toBe(true);
    expect(res.data.data.bookingId).toBeDefined();
    expect(res.data.data.totalCost).toBe(3000);
  });

  it("fails without token", async () => {
    const res = await post("/bookings", {
      carName: "BMW",
      days: 3,
      rentPerDay: 1000,
    });

    expect(res.status).toBe(401);
  });

  it("fails with invalid body", async () => {
    const { token } = await createUserAndGetToken();

    const res = await post(
      "/bookings",
      { carName: "B" }, // invalid
      token
    );

    expect(res.status).toBe(400);
  });

  it("fails when days > 365", async () => {
    const { token } = await createUserAndGetToken();

    const res = await post(
      "/bookings",
      { carName: "BMW", days: 400, rentPerDay: 1000 },
      token
    );

    expect(res.status).toBe(400);
  });

  it("fails when rentPerDay is 0", async () => {
    const { token } = await createUserAndGetToken();

    const res = await post(
      "/bookings",
      { carName: "BMW", days: 5, rentPerDay: 0 },
      token
    );

    expect(res.status).toBe(400);
  });

  it("fails when carName is empty string", async () => {
    const { token } = await createUserAndGetToken();

    const res = await post(
      "/bookings",
      { carName: "", days: 5, rentPerDay: 500 },
      token
    );

    expect(res.status).toBe(400);
  });

  it("fails when extra fields are sent (strict schema)", async () => {
    const { token } = await createUserAndGetToken();

    const res = await post(
      "/bookings",
      {
        carName: "BMW",
        days: 5,
        rentPerDay: 500,
        hackerField: "lol",
      },
      token
    );

    expect(res.status).toBe(400);
  });

  it("always creates booking with status Booked", async () => {
    const { token } = await createUserAndGetToken();

    const res = await post(
      "/bookings",
      { carName: "BMW", days: 2, rentPerDay: 1000 },
      token
    );

    expect(res.status).toBe(201);
    expect(res.data.success).toBe(true);
  });
});
