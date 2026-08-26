const User = require("../models/User");

// Returns every user except the logged-in user.
exports.getChatUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } })
      .select("name email")
      .sort({ name: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
