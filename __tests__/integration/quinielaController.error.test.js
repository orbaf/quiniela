const request = require("supertest");
const app = require("../../src/infrastructure/driving-adapters/express/app");
const GetQuinielaUseCase = require("../../src/application/use-cases/GetQuinielaUseCase");

// Mock the use case to throw an error
jest.mock("../../src/application/use-cases/GetQuinielaUseCase", () => {
  return jest.fn().mockImplementation(() => {
    return {
      execute: jest.fn().mockImplementation(() => {
        throw new Error("Internal Server Error Simulation");
      }),
    };
  });
});

describe("Quiniela Controller - Error Handling", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return 500 if the use case throws an unexpected error", async () => {
    const response = await request(app)
      .get("/api?lang=es&dream=10")
      .expect(500);

    expect(response.body.status).toBe("error");
    expect(response.body.errors).toEqual(["Internal Server Error"]);
  });
});
