const swaggerLanguageMiddleware = require("../../src/infrastructure/driving-adapters/express/middlewares/swaggerLanguage");
const getSwaggerSpec = require("../../src/infrastructure/driving-adapters/express/docs/swaggerLoader");

// Mock the swagger loader
jest.mock(
  "../../src/infrastructure/driving-adapters/express/docs/swaggerLoader",
  () => jest.fn()
);

describe("Swagger Language Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      query: {},
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    next = jest.fn();
    getSwaggerSpec.mockClear();
  });

  test("should select language from query param 'lang=en'", () => {
    req.query.lang = "en";
    swaggerLanguageMiddleware(req, res, next);
    expect(getSwaggerSpec).toHaveBeenCalledWith("en");
    expect(req.selectedLanguage).toBe("en");
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("should select language from 'Accept-Language' header", () => {
    req.headers["accept-language"] = "en-US,en;q=0.9,es;q=0.8";
    swaggerLanguageMiddleware(req, res, next);
    expect(getSwaggerSpec).toHaveBeenCalledWith("en");
    expect(req.selectedLanguage).toBe("en");
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("should use default language 'es' if no lang is provided", () => {
    swaggerLanguageMiddleware(req, res, next);
    expect(getSwaggerSpec).toHaveBeenCalledWith("es");
    expect(req.selectedLanguage).toBe("es");
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("should use default language 'es' if provided lang is invalid", () => {
    req.query.lang = "fr";
    req.headers["accept-language"] = "de";
    swaggerLanguageMiddleware(req, res, next);
    expect(getSwaggerSpec).toHaveBeenCalledWith("es");
    expect(req.selectedLanguage).toBe("es");
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("should handle errors when swagger spec loader fails", () => {
    getSwaggerSpec.mockImplementation(() => {
      throw new Error("File not found");
    });
    // Mock console.error to prevent logging during tests
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    swaggerLanguageMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith("Could not load API documentation.");
    expect(next).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
