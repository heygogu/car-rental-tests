import { describe, it, expect } from "vitest";
import { post, generateUsername } from "../helpers.js";

describe("AUTH /signup", () => {
  it("creates a new user", async () => {
    const username = generateUsername();

    const res = await post("/auth/signup", {
      username,
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.data.success).toBe(true);
    expect(res.data.data.userId).toBeDefined();
  });

  it("rejects duplicate usernames", async () => {
    const username = generateUsername();

    await post("/auth/signup", {
      username,
      password: "password123",
    });

    const res = await post("/auth/signup", {
      username,
      password: "password123",
    });

    expect(res.status).toBe(409);
    expect(res.data.success).toBe(false);
    expect(res.data.data.message).toBe("username already exists");
  });

  it("fails without password", async () => {
    const res = await post("/auth/signup", {
      username: generateUsername(),
    });

    expect(res.status).toBe(400);
  });

  it("fails without username", async () => {
    const res = await post("/auth/signup", {
      password: "password123",
    });

    expect(res.status).toBe(400);
  });

  it("does not leak plain password", async () => {
    const username = generateUsername();

    const res = await post("/auth/signup", {
      username,
      password: "password123",
    });

    expect(JSON.stringify(res.data)).not.toContain("password123");
  });
});
