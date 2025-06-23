const GetQuinielaUseCase = require("../../src/application/use-cases/GetQuinielaUseCase");
const IQuinielaRepository = require("../../src/application/ports/out/IQuinielaRepository");

// Mock del Repositorio para no depender de la capa de persistencia
class MockQuinielaRepository extends IQuinielaRepository {
  getMessage(lang, key) {
    if (key === "invalidLang") return "Invalid language";
    if (key === "invalidDream") return "Invalid dream number";
    if (key === "quiniela") return "Your number is";
    if (key === "significado") return "it means";
    return "";
  }

  getDreamMeaning(lang, number) {
    if (lang === "es" && number === 42) return "El universo";
    if (lang === "es" && number === 0)
      return "El huevo - Comienzo de algo nuevo";
    return "A meaning";
  }
}

describe("GetQuinielaUseCase - Unit Tests", () => {
  let getQuinielaUseCase;
  let mockRepo;

  beforeEach(() => {
    mockRepo = new MockQuinielaRepository();
    getQuinielaUseCase = new GetQuinielaUseCase(mockRepo);
  });

  test("should return the correct meaning for a specific dream number", () => {
    const result = getQuinielaUseCase.execute("es", 42);
    expect(result.number).toBe(42);
    expect(result.meaning).toBe("El universo");
    expect(result.message).toContain("42");
    expect(result.message).toContain("El universo");
    expect(result.error).toBeUndefined();
  });

  test("should return the correct meaning for dream number 0 sent as a string", () => {
    const result = getQuinielaUseCase.execute("es", "0");
    expect(result.number).toBe(0);
    expect(result.meaning).toBe("El huevo - Comienzo de algo nuevo");
    expect(result.message).toContain(" 0,");
    expect(result.message).toContain("El huevo - Comienzo de algo nuevo");
    expect(result.error).toBeUndefined();
  });

  test("should return an error for an invalid language", () => {
    const result = getQuinielaUseCase.execute("fr", 10);
    expect(result.error).toBe("Invalid language");
  });

  test("should return an error for an out-of-range dream number", () => {
    const result = getQuinielaUseCase.execute("es", 101);
    expect(result.error).toBe("Invalid dream number");
  });

  test("should return an error for a non-numeric dream number", () => {
    const result = getQuinielaUseCase.execute("es", "abc");
    expect(result.error).toBe("Invalid dream number");
  });

  test("should generate a random number between 0 and 99 if no dream number is provided", () => {
    const result = getQuinielaUseCase.execute("es", undefined);
    expect(result.number).toBeGreaterThanOrEqual(0);
    expect(result.number).toBeLessThanOrEqual(99);
    expect(result.meaning).toBeDefined();
    expect(result.error).toBeUndefined();
  });
});
