const express = require("express");
const router = express.Router();

const {
  addTextEntry,
  addImageEntry,
  getChatByDate,
  getChatHistory,
} = require("../controllers/chat.controller");
const { protect } = require("../middleware/auth.middleware");

// POST /api/chat/entry/text
router.post("/entry/text", protect, addTextEntry);

// POST /api/chat/entry/image
router.post("/entry/image", protect, addImageEntry);

// GET /api/chat/history
// IMPORTANT: must be declared BEFORE /:date to avoid Express matching "history" as a date param
router.get("/history", protect, getChatHistory);

// GET /api/chat/:date
router.get("/:date", protect, getChatByDate);

module.exports = router;
