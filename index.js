const app = require("./src/infrastructure/driving-adapters/express/app");

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API Documentation available at http://localhost:${PORT}/docs`);
    console.log(`Environment: ${NODE_ENV}`);
  });
}

module.exports = app;
