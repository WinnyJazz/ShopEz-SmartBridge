const mongoose = require("mongoose");

const lastMessageSchema = new mongoose.Schema(
  {
    text: { type: String, trim: true, maxlength: 2000 },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date },
  },
  { _id: false }
);

const chatConversationSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastMessage: { type: lastMessageSchema, default: null },
  },
  { timestamps: true }
);

chatConversationSchema.index({ buyer: 1, seller: 1 }, { unique: true });

module.exports = mongoose.model("ChatConversation", chatConversationSchema);
