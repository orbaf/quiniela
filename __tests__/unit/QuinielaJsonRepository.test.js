const QuinielaJsonRepository = require("../../src/infrastructure/driven-adapters/persistence/json/QuinielaJsonRepository");
const path = require("path");

describe("QuinielaJsonRepository", () => {
  let repository;
  const mockMessagesPath = path.join(
    __dirname,
    "../../src/infrastructure/driven-adapters/persistence/json/messages.json"
  );
  const mockMeaningsPath = path.join(
    __dirname,
    "../../src/infrastructure/driven-adapters/persistence/json/dreamMeanings.json"
  );

  beforeEach(() => {
    // We can pass the paths to our mock JSON files
    repository = new QuinielaJsonRepository(mockMessagesPath, mockMeaningsPath);
  });

  describe("getDreamMeaning", () => {
    test("should return the correct meaning in Spanish", () => {
      const meaning = repository.getDreamMeaning("es", 0);
      expect(meaning).toBe("El huevo - Comienzo de algo nuevo");
    });

    test("should return the correct meaning in English", () => {
      const meaning = repository.getDreamMeaning("en", 5);
      expect(meaning).toBe("The cat - Mystery and luck");
    });

    test("should return a default message for an unknown number", () => {
      const meaning = repository.getDreamMeaning("es", 999);
      expect(meaning).toBe("Meaning not found");
    });

    test("should return a default message for an unknown language", () => {
      const meaning = repository.getDreamMeaning("fr", 10);
      expect(meaning).toBe("Meaning not found");
    });
  });

  describe("getMessage", () => {
    test("should return the correct message in Spanish", () => {
      const message = repository.getMessage("es", "quiniela");
      expect(message).toBe("Tu número de la quiniela es");
    });

    test("should return the correct message in English", () => {
      const message = repository.getMessage("en", "invalidDream");
      expect(message).toBe(
        "Hey dude! The dream number must be between 0 and 99"
      );
    });

    test("should return a default key for an unknown key", () => {
      const message = repository.getMessage("es", "unknown_key");
      expect(message).toBe("Message not found");
    });

    test("should return a default key for an unknown language", () => {
      const message = repository.getMessage("fr", "quiniela");
      expect(message).toBe("Message not found");
    });
  });
});
