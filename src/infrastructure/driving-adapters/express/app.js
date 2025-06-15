const express = require("express");
const swaggerUi = require("swagger-ui-express");
const queryValidator = require("./middlewares/queryValidator");
const swaggerLanguageMiddleware = require("./middlewares/swaggerLanguage");
const quinielaRouter = require("./routes/quiniela.router");
const getSwaggerSpec = require("./docs/swaggerLoader");

const app = express();

// --- Middlewares ---
app.use(express.json());
app.use(queryValidator);

// --- Routes ---
app.use("/", quinielaRouter);

// --- Swagger Docs ---
app.use("/docs", swaggerLanguageMiddleware, swaggerUi.serve, (req, res) => {
  const swaggerSpec = getSwaggerSpec(req.selectedLanguage);
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Quiniela API Documentation",
  })(req, res);
});

// --- Error Handling ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    errors: ["Internal server error"],
    timestamp: new Date().toISOString(),
  });
});

module.exports = app;
