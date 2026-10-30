const mongoose = require("mongoose");
const ChatConversation = require("../models/ChatConversation");
const ChatMessage = require("../models/ChatMessage");
const User = require("../models/User");

const PARTICIPANT_FIELDS = "name role profileImage shopImage shopName";

function isParticipant(conversation, userId) {
  return (
    String(conversation.buyer) === String(userId) ||
    String(conversation.seller) === String(userId)
  );
}

exports.getConversations = async (req, res) => {
  try {
    const conversations = await ChatConversation.find({
      $or: [{ buyer: req.user.userId }, { seller: req.user.userId }],
    })
      .sort({ updatedAt: -1 })
      .populate("buyer", PARTICIPANT_FIELDS)
      .populate("seller", PARTICIPANT_FIELDS);

    return res.status(200).json({ conversations });
  } catch (error) {
    console.error("Get chat conversations error:", error.message);
    return res.status(500).json({ message: "Failed to load conversations." });
  }
};

exports.startConversation = async (req, res) => {
  try {
    const { sellerId } = req.body;

    if (!mongoose.isValidObjectId(sellerId)) {
      return res.status(400).json({ message: "Invalid seller." });
    }

    if (String(sellerId) === String(req.user.userId)) {
      return res.status(400).json({ message: "You cannot chat with yourself." });
    }

    if (req.user.role === "seller") {
      return res.status(403).json({
        message: "Only buyers can start a conversation with a shop.",
      });
    }

    const seller = await User.findOne({ _id: sellerId, role: "seller" }).select(
      "_id"
    );
    if (!seller) {
      return res.status(404).json({ message: "Seller not found." });
    }

    let conversation = await ChatConversation.findOne({
      buyer: req.user.userId,
      seller: seller._id,
    });

    if (!conversation) {
      try {
        conversation = await ChatConversation.create({
          buyer: req.user.userId,
          seller: seller._id,
        });
      } catch (error) {
        if (error.code !== 11000) throw error;
        conversation = await ChatConversation.findOne({
          buyer: req.user.userId,
          seller: seller._id,
        });
      }
    }

    await conversation.populate("buyer", PARTICIPANT_FIELDS);
    await conversation.populate("seller", PARTICIPANT_FIELDS);

    return res.status(200).json({ conversation });
  } catch (error) {
    console.error("Start chat conversation error:", error.message);
    return res.status(500).json({ message: "Failed to start conversation." });
  }
};

exports.getMessages = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.conversationId)) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    const conversation = await ChatConversation.findById(
      req.params.conversationId
    );
    if (!conversation || !isParticipant(conversation, req.user.userId)) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    await ChatMessage.updateMany(
      {
        conversation: conversation._id,
        sender: { $ne: req.user.userId },
        readAt: null,
      },
      { $set: { readAt: new Date() } }
    );

    const messages = await ChatMessage.find({
      conversation: conversation._id,
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("sender", "name role")
      .lean();

    return res.status(200).json({ messages: messages.reverse() });
  } catch (error) {
    console.error("Get chat messages error:", error.message);
    return res.status(500).json({ message: "Failed to load messages." });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.conversationId)) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    const text = typeof req.body.text === "string" ? req.body.text.trim() : "";
    if (!text || text.length > 2000) {
      return res.status(400).json({
        message: "Messages must contain 1–2000 characters.",
      });
    }

    const conversation = await ChatConversation.findById(
      req.params.conversationId
    );
    if (!conversation || !isParticipant(conversation, req.user.userId)) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    const message = await ChatMessage.create({
      conversation: conversation._id,
      sender: req.user.userId,
      text,
    });

    conversation.lastMessage = {
      text,
      sender: req.user.userId,
      createdAt: message.createdAt,
    };
    await conversation.save();
    await message.populate("sender", "name role");

    return res.status(201).json({ message });
  } catch (error) {
    console.error("Send chat message error:", error.message);
    return res.status(500).json({ message: "Failed to send message." });
  }
};
