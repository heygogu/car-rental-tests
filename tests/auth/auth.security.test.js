import { describe, it, expect } from "vitest";
import { post } from "../helpers.js";

describe("AUTH security invariants", () => {
  it("should not leak internal error details", async () => {
    const res = await post("/auth/signup", null);

    expect(JSON.stringify(res.data)).not.toMatch(/prisma|bcrypt|stack/i);
  });

  it("JWT token should be returned only on successful login", async () => {
    const res = await post("/auth/login", {
      username: "random",
      password: "random",
    });

    expect(res.data?.data?.token).toBeUndefined();
  });
});
