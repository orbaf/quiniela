class GetQuinielaUseCase {
  constructor(quinielaRepository) {
    this.quinielaRepository = quinielaRepository;
  }

  validateLanguage(lang) {
    return ["es", "en"].includes(lang);
  }

  validateDreamNumber(dream) {
    const num = parseInt(dream, 10);
    return !isNaN(num) && num >= 0 && num <= 99;
  }

  generateQuinielaNumber() {
    return Math.floor(Math.random() * 100);
  }

  execute(lang, dream) {
    if (!this.validateLanguage(lang)) {
      return {
        error: this.quinielaRepository.getMessage(lang, "invalidLang"),
      };
    }

    const isDreamProvided = dream != null && dream !== "";

    if (isDreamProvided && !this.validateDreamNumber(dream)) {
      return {
        error: this.quinielaRepository.getMessage(lang, "invalidDream"),
      };
    }

    const number = isDreamProvided
      ? parseInt(dream, 10)
      : this.generateQuinielaNumber();
    const meaning = this.quinielaRepository.getDreamMeaning(lang, number);

    return {
      number,
      meaning,
      message: `${this.quinielaRepository.getMessage(
        lang,
        "quiniela"
      )} ${number}, ${this.quinielaRepository.getMessage(
        lang,
        "significado"
      )}: ${meaning}.`,
    };
  }
}

module.exports = GetQuinielaUseCase;
