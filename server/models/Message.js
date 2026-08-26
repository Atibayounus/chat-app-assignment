const mongoose = require("mongoose");

// TODO (student):
// The unread count feature needs one more field here, for example "read".
// Think: what should its value be when a message is first created?
const messageSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    // read: ...
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
