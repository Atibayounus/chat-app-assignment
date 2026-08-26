const router = require("express").Router();
const requireAuth = require("../middleware/auth");
const { getChatUsers } = require("../controllers/chatController");

router.get("/users", requireAuth, getChatUsers);

module.exports = router;
