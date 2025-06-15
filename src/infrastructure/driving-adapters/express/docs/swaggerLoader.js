const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const getSwaggerSpec = (lang = "es") => {
  const fileName = `swagger.${lang}.yaml`;
  const filePath = path.join(__dirname, fileName);

  if (!fs.existsSync(filePath)) {
    const defaultFilePath = path.join(__dirname, "swagger.es.yaml");
    if (fs.existsSync(defaultFilePath)) {
      const doc = yaml.load(fs.readFileSync(defaultFilePath, "utf8"));
      return doc;
    }
    throw new Error("Default Swagger specification file not found.");
  }

  const doc = yaml.load(fs.readFileSync(filePath, "utf8"));
  return doc;
};

module.exports = getSwaggerSpec;
