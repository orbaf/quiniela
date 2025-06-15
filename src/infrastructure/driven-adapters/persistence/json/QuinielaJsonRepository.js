const IQuinielaRepository = require("../../../../application/ports/out/IQuinielaRepository");
const dreamMeanings = require("./dreamMeanings.json");
const messages = require("./messages.json");

class QuinielaJsonRepository extends IQuinielaRepository {
  constructor() {
    super();
  }

  getDreamMeaning(lang, number) {
    return dreamMeanings[lang]?.[number] || "Meaning not found";
  }

  getMessage(lang, key) {
    return messages[lang]?.[key] || "Message not found";
  }
}

module.exports = QuinielaJsonRepository;
