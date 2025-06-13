const express = require("express");
const router = express.Router();
const quinielaController = require("../controllers/quiniela.controller");

router.get("/", quinielaController.getQuiniela);

module.exports = router;
