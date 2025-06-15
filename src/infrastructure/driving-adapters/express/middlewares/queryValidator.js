const validateQuery = (req, res, next) => {
  const { lang, dream } = req.query;
  const errors = [];

  // Validate language if provided
  if (lang && !["es", "en"].includes(lang.toLowerCase())) {
    errors.push("Invalid 'lang' parameter. Only 'es' or 'en' are allowed.");
  }

  // Validate dream number if provided
  if (dream !== undefined) {
    const dreamNum = parseInt(dream, 10);
    if (isNaN(dreamNum) || dreamNum < 0 || dreamNum > 99) {
      errors.push(
        "Invalid 'dream' parameter. It must be a number between 0 and 99."
      );
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: "error",
      errors,
      timestamp: new Date().toISOString(),
    });
  }

  // Normalize parameters
  req.query.lang = (lang || "es").toLowerCase();
  if (dream !== undefined) {
    req.query.dream = parseInt(dream, 10);
  }

  next();
};

module.exports = validateQuery;
