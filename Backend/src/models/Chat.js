const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema(
  {
    order: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "img"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
    },
    entries: [entrySchema],
  },
  { timestamps: true }
);

// Compound index for fast date lookups per user
chatSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model("Chat", chatSchema);
