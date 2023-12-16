const express = require("express");
const router = express.Router();
require("dotenv/config");
const supabase = require("../../../utils/supabase");
const fileSaving = require("../../../utils/fileSaving");

const MESSAGE_IMAGES = __dirname + "\\message_images";

router.post("/send", async (req, res) => {
  const { message, user_id, chat_id, image } = req.body;

  try {
    if (!message || !user_id || !chat_id) throw new Error("Fields are empty");

    let insert_object = { content: message, user_id, chat_id };

    if (image) {
      const path = await fileSaving.writeToFile(MESSAGE_IMAGES, image);
      insert_object.image = path;
    }

    const { data, error } = await supabase
      .from("messages")
      .insert(insert_object)
      .select();

    if (error) throw new Error(error);

    const message_id = data[0].id;
    let chat_update = await supabase
      .from("chats")
      .update({ last_message: message_id, updated_at: new Date() })
      .eq("id", chat_id);

    if (chat_update.error) throw new Error("Could not update chats");

    return res.status(200).json({ success: "Message sent successfully" });
  } catch (err) {
    return res
      .status(400)
      .json({ error: "Could not send message", content: err });
  }
});

router.get("/getall", async (req, res) => {
  const chat_id = req.query.chat_id;
  const start = req.query.start;
  const end = req.query.end;

  try {
    if (!chat_id) throw new Error("No chat id provided");
    const { data, error } = await supabase
      .from("messages")
      .select()
      .eq("chat_id", chat_id)
      .order("id", { ascending: false })
      .range(start, end);

    if (error) throw new Error(error);

    data.forEach((msg) => {
      if (msg.image) {
        let base64 = fileSaving.getBase64(MESSAGE_IMAGES, msg.image);
        msg.image = base64;
      }
    });

    res.status(200).json(data);
  } catch (err) {
    return res
      .status(400)
      .json({ error: "Could not get messages", content: err });
  }
});

module.exports = router;
