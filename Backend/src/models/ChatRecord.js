const mongoose = require("mongoose");

const chatRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one record per user
    },
    dates: {
      type: Map,
      of: mongoose.Schema.Types.ObjectId, // each value is a ref to Chat._id
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatRecord", chatRecordSchema);
