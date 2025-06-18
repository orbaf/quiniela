const request = require("supertest");
const app = require("../../src/infrastructure/driving-adapters/express/app");

describe("Quiniela API - Integration Tests", () => {
  describe("GET /api", () => {
    test("should return 200 OK with a valid quiniela result when no params are sent", async () => {
      const response = await request(app).get("/api").expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.number).toBeGreaterThanOrEqual(0);
      expect(response.body.data.number).toBeLessThanOrEqual(99);
      expect(response.body.data.meaning).toBeDefined();
    });

    test("should return 200 OK with the correct meaning for a specific dream number", async () => {
      const response = await request(app).get("/api?dream=25").expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.number).toBe(25);
      expect(response.body.data.meaning).toContain("gato"); // Assuming 25 is 'El gato'
    });

    test("should return 200 OK with the response in English", async () => {
      const response = await request(app)
        .get("/api?lang=en&dream=42")
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.number).toBe(42);
      expect(response.body.data.message).toContain(
        "Your quiniela number is 42"
      );
    });

    test("should return 400 Bad Request for an invalid language", async () => {
      const response = await request(app).get("/api?lang=xx").expect(400);

      expect(response.body.status).toBe("error");
      expect(response.body.errors[0]).toContain("Invalid 'lang' parameter");
    });

    test("should return 400 Bad Request for an out-of-range dream number", async () => {
      const response = await request(app).get("/api?dream=101").expect(400);

      expect(response.body.status).toBe("error");
      expect(response.body.errors[0]).toContain("Invalid 'dream' parameter");
    });

    test("should return 400 Bad Request for a non-numeric dream number", async () => {
      const response = await request(app).get("/api?dream=abc").expect(400);

      expect(response.body.status).toBe("error");
      expect(response.body.errors[0]).toContain("Invalid 'dream' parameter");
    });
  });
});
