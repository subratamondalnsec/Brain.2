const express = require("express");
const router = express.Router();

const { sendQuery } = require("../controllers/query.controller");
const { protect } = require("../middleware/auth.middleware");

// POST /api/query
router.post("/", protect, sendQuery);

module.exports = router;
