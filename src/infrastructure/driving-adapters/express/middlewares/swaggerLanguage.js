const getSwaggerSpec = require("../docs/swaggerLoader");

const swaggerLanguageMiddleware = (req, res, next) => {
  // Get language from query parameter
  const lang = req.query.lang;

  // Get language from Accept-Language header if no query parameter
  const acceptLanguage = req.headers["accept-language"];

  // Determine the language to use
  let selectedLanguage = "es"; // Default to Spanish

  if (lang && ["en", "es"].includes(lang.toLowerCase())) {
    selectedLanguage = lang.toLowerCase();
  } else if (acceptLanguage) {
    const preferredLanguage = acceptLanguage
      .split(",")[0]
      .split("-")[0]
      .toLowerCase();
    if (["en", "es"].includes(preferredLanguage)) {
      selectedLanguage = preferredLanguage;
    }
  }

  // Get the appropriate Swagger specification
  try {
    const swaggerSpec = getSwaggerSpec(selectedLanguage);
    // Attach the specification to the request object
    req.swaggerSpec = swaggerSpec;
    req.selectedLanguage = selectedLanguage;
  } catch (error) {
    // Handle case where swagger file might be missing
    console.error(
      `Could not load swagger spec for lang=${selectedLanguage}`,
      error
    );
    return res.status(500).send("Could not load API documentation.");
  }

  next();
};

module.exports = swaggerLanguageMiddleware;
