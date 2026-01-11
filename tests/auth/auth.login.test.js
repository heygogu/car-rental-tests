import { describe, it, expect } from "vitest";
import { post, generateUsername } from "../helpers.js";

describe("AUTH /login", () => {
  it("logs in with correct credentials", async () => {
    const username = generateUsername();
    const password = "password123";

    await post("/auth/signup", { username, password });

    const res = await post("/auth/login", {
      username,
      password,
    });
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(res.data.data.token).toBeDefined();
  });

  it("rejects wrong password", async () => {
    const username = generateUsername();

    await post("/auth/signup", {
      username,
      password: "correct",
    });

    const res = await post("/auth/login", {
      username,
      password: "wrong",
    });

    expect(res.status).toBe(401);
    expect(res.data.data.message).toBe("incorrect password");
  });

  it("rejects non-existent user", async () => {
    const res = await post("/auth/login", {
      username: "ghost_user",
      password: "password123",
    });

    expect(res.status).toBe(401);
    expect(res.data.data.message).toBe("user does not exist");
  });

  it("fails without password", async () => {
    const res = await post("/auth/login", {
      username: "someone",
    });

    expect(res.status).toBe(400);
  });
});
