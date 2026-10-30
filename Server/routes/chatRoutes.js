const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getConversations,
  startConversation,
  getMessages,
  sendMessage,
} = require("../controllers/chatController");

router.use(authMiddleware);
router.get("/conversations", getConversations);
router.post("/conversations", startConversation);
router.get("/conversations/:conversationId/messages", getMessages);
router.post("/conversations/:conversationId/messages", sendMessage);

module.exports = router;
