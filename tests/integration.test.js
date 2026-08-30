import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import mongoose from "mongoose";

import app from "../app.js";
import { connectDB } from "../config/db.js";

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("API Integration Tests", () => {
  // Test 1: Get all stations
  it("GET /api/v1/stations should return 200", async () => {
    const response = await request(app)
      .get("/api/v1/stations");

    expect(response.statusCode).toBe(200);
  });

  // Test 2: Login with valid admin credentials
  it("POST /api/v1/auth/login should return a JWT token", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "admin@metrosync.com",
        password: "Admin123!",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(typeof response.body.token).toBe("string");
  });

  // Test 3: Create announcement without authentication
  it(
    "POST /api/v1/stations/:id/announcements without authorization should return 401",
    async () => {
      const stationId = "60c72b2f9b1d8b2d88f12345";

      const response = await request(app)
        .post(`/api/v1/stations/${stationId}/announcements`)
        .send({
          text: "Test announcement",
        });

      expect(response.statusCode).toBe(401);
    }
  );
});