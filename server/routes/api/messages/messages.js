const express = require("express");
const router = express.Router();
require("dotenv/config");
const supabase = require("../../../utils/supabase");

router.post("/send", async (req, res) => {
  const { message, user_id, chat_id } = req.body;

  try {
    if (!message || !user_id || !chat_id) throw new Error("Fields are empty");

    const { error } = await supabase
      .from("messages")
      .insert({ content: message, user_id, chat_id });

    if (error) throw new Error(error);

    return res.status(200).json({ success: "Message sent successfully" });
  } catch (err) {
    return res
      .status(400)
      .json({ error: "Could not send message", content: err });
  }
});

router.get("/getall", async (req, res) => {
  const chat_id = req.query.chat_id;

  try {
    if (!chat_id) throw new Error("No chat id provided");
    const { data, error } = await supabase
      .from("messages")
      .select()
      .eq("chat_id", chat_id);

    if (error) throw new Error(error);

    res.status(200).json(data);
  } catch (err) {
    return res
      .status(400)
      .json({ error: "Could not get messages", content: err });
  }
});

module.exports = router;
