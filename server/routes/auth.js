const router = require("express").Router();
const requireAuth = require("../middleware/auth");
const c = require("../controllers/authController");

router.post("/register", c.register);
router.post("/login", c.login);
router.post("/logout", c.logout);
router.get("/me", requireAuth, c.me);

module.exports = router;
