import jwt from "jsonwebtoken";

const BASE_URL = "http://localhost:3000";
const JWT_SECRET = "123";

async function httpRequest(method, path, body = null, token = null) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = { method, headers };

  if (body && ["POST", "PUT", "PATCH"].includes(method)) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, options);

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return {
    status: response.status,
    data,
  };
}

export const post = (path, body, token = null) =>
  httpRequest("POST", path, body, token);

export const get = (path, token = null) =>
  httpRequest("GET", path, null, token);

export const put = (path, body, token = null) =>
  httpRequest("PUT", path, body, token);

export const del = (path, token = null) =>
  httpRequest("DELETE", path, null, token);

function generateEmail(prefix = "test") {
  return `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .substring(7)}@test.com`;
}

function generateUsername(prefix = "test") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

async function createUser(role, supervisorId = null, name = null) {
  const email = generateEmail(role);
  const body = {
    name: name || `Test ${role}`,
    email,
    password: "password123",
    role,
  };

  if (role === "agent" && supervisorId) {
    body.supervisorId = supervisorId;
  }

  const response = await post("/auth/signup", body);
  if (!response.data.success) {
    throw new Error(`Failed to create ${role}: ${response.data.error}`);
  }

  const loginResponse = await post("/auth/login", {
    email,
    password: "password123",
  });
  if (!loginResponse.data.success) {
    throw new Error(`Failed to login as ${role}: ${loginResponse.data.error}`);
  }

  return {
    ...response.data.data,
    token: loginResponse.data.data.token,
    email,
    password: "password123",
  };
}

function generateTestToken(userId, username) {
  return jwt.sign({ userId, username }, JWT_SECRET);
}

async function createUserAndGetToken() {
  const username = generateUsername("booking");
  const password = "password123";

  // signup
  const signup = await post("/auth/signup", {
    username,
    password,
  });

  if (signup.status !== 201) {
    throw new Error("User signup failed");
  }

  const userId = signup.data.data.userId;

  // login
  const login = await post("/auth/login", {
    username,
    password,
  });

  if (login.status !== 200) {
    throw new Error("User login failed");
  }

  return {
    userId,
    username,
    token: login.data.data.token,
  };
}

export {
  BASE_URL,
  JWT_SECRET,
  httpRequest,
  generateEmail,
  createUser,
  generateTestToken,
  generateUsername,
  createUserAndGetToken,
};
