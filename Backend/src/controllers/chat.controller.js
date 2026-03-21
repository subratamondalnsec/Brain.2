const fs = require("fs");
const Chat = require("../models/Chat");
const ChatRecord = require("../models/ChatRecord");
const cloudinary = require("../config/cloudinary");

// ─── Helper ───────────────────────────────────────────────────────────────────
const getTodayString = () => new Date().toISOString().split("T")[0];

// ─── FUNCTION 1: addTextEntry ─────────────────────────────────────────────────
// POST /api/chat/entry/text
const addTextEntry = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Text content is required" });
    }

    const today = getTodayString();

    // Find or create Chat for today
    let chat = await Chat.findOne({ userId: req.user._id, date: today });
    if (!chat) {
      chat = await Chat.create({ userId: req.user._id, date: today, entries: [] });
    }

    const nextOrder = chat.entries.length + 1;

    chat.entries.push({ order: nextOrder, type: "text", content: text.trim() });
    await chat.save();

    // Update ChatRecord date index
    await ChatRecord.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { [`dates.${today}`]: chat._id } },
      { upsert: true, new: true }
    );

    const newEntry = chat.entries[chat.entries.length - 1];

    return res.status(201).json({
      success: true,
      message: "Text entry added",
      entry: newEntry,
      date: today,
    });
  } catch (error) {
    console.error("addTextEntry error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── FUNCTION 2: addImageEntry ────────────────────────────────────────────────
// POST /api/chat/entry/image  (multipart/form-data, field: "image")
const addImageEntry = async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res
        .status(400)
        .json({ success: false, message: "Image file is required" });
    }

    const caption = req.body.caption || "";
    const today = getTodayString();

    // Upload to Cloudinary via temp file path (no base64 encoding)
    const file = req.files.image;

    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "second-brain/chat-images",
      resource_type: "image",
    });

    // Auto-delete temp file after upload — no need to store on server
    try { fs.unlinkSync(file.tempFilePath); } catch (_) {}

    const imageUrl = result.secure_url;

    // Find or create Chat for today
    let chat = await Chat.findOne({ userId: req.user._id, date: today });
    if (!chat) {
      chat = await Chat.create({ userId: req.user._id, date: today, entries: [] });
    }

    const nextOrder = chat.entries.length + 1;

    chat.entries.push({
      order: nextOrder,
      type: "img",
      content: imageUrl,
      caption,
    });
    await chat.save();

    // Update ChatRecord date index
    await ChatRecord.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { [`dates.${today}`]: chat._id } },
      { upsert: true, new: true }
    );

    const newEntry = chat.entries[chat.entries.length - 1];

    return res.status(201).json({
      success: true,
      message: "Image entry added",
      entry: newEntry,
      date: today,
    });
  } catch (error) {
    console.error("addImageEntry error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── FUNCTION 3: getChatByDate ────────────────────────────────────────────────
// GET /api/chat/:date
const getChatByDate = async (req, res) => {
  try {
    const { date } = req.params;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    const today = getTodayString();
    const isPast = date < today;
    const isFuture = date > today;

    if (isFuture) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot fetch future dates" });
    }

    const chat = await Chat.findOne({ userId: req.user._id, date });
    if (!chat) {
      return res.status(200).json({
        success: true,
        date,
        entries: [],
        message: "No entries for this date",
      });
    }

    const sorted = chat.entries.sort((a, b) => a.order - b.order);

    return res.status(200).json({
      success: true,
      date,
      isToday: date === today,
      isPast,
      totalEntries: sorted.length,
      entries: sorted,
    });
  } catch (error) {
    console.error("getChatByDate error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── FUNCTION 4: getChatHistory ───────────────────────────────────────────────
// GET /api/chat/history
const getChatHistory = async (req, res) => {
  try {
    const record = await ChatRecord.findOne({ userId: req.user._id });
    if (!record) {
      return res.status(200).json({ success: true, history: [] });
    }

    // Sort date keys newest first
    const dateKeys = Array.from(record.dates.keys()).sort().reverse();

    return res.status(200).json({
      success: true,
      totalDays: dateKeys.length,
      history: dateKeys,
    });
  } catch (error) {
    console.error("getChatHistory error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = { addTextEntry, addImageEntry, getChatByDate, getChatHistory };
