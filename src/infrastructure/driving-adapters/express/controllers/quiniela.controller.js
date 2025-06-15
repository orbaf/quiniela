const GetQuinielaUseCase = require("../../../../application/use-cases/GetQuinielaUseCase");
const QuinielaJsonRepository = require("../../../driven-adapters/persistence/json/QuinielaJsonRepository");

class QuinielaController {
  getQuiniela(req, res) {
    const { lang, dream } = req.query;

    try {
      // Instantiate repository and use case
      const quinielaRepository = new QuinielaJsonRepository();
      const getQuinielaUseCase = new GetQuinielaUseCase(quinielaRepository);

      const result = getQuinielaUseCase.execute(lang, dream);

      if (result.error) {
        return res.status(400).json({
          status: "error",
          errors: [result.error],
          timestamp: new Date().toISOString(),
        });
      }

      res.status(200).json({
        status: "success",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "error",
        errors: ["Internal Server Error"],
        timestamp: new Date().toISOString(),
      });
    }
  }
}

module.exports = new QuinielaController();
