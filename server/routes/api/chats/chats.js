const express = require("express");
const router = express.Router();
require("dotenv/config");
const supabase = require("../../../utils/supabase");
const fileSaving = require("../../../utils/fileSaving");

const COVER_IMAGES = __dirname + "\\cover_images";

router.put("/modify", async (req, res) => {
  const { chat_id, base64, name, users } = req.body;

  try {
    let update_object = {};

    if (base64) {
      const path = await fileSaving.writeToFile(COVER_IMAGES, base64);
      update_object.image = path;
    }

    if (name) update_object.name = name;

    if (users.length > 1) update_object.user_ids = users;

    const { error } = await supabase
      .from("chats")
      .update(update_object)
      .eq("id", chat_id);

    if (error) throw new Error("Could not update chat");

    return res.status(200).json({ success: "Update successful" });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Error saving chat data", content: err });
  }
});

router.get("/getchats", async (req, res) => {
  try {
    const { data, error } = await supabase.rpc("get_chats_with_users", {
      user_id: req.user.user.id,
    });

    if (error) throw new Error(error);

    explicitUsers(data);

    data.map((chat) => {
      if (chat.image)
        chat.image = fileSaving.getBase64(COVER_IMAGES, chat.image);
    });

    res.status(200).json(data);
  } catch (err) {
    return res.status(400).json({ error: "Could not get chats" });
  }
});

router.post("/createchat", async (req, res) => {
  const { name, users, base64 } = req.body;

  try {
    if (!name || !users || users.length < 2)
      throw new Error("Insufficient paramters");

    let create_object = { name, user_ids: users };

    if (base64) {
      const path = await fileSaving.writeToFile(COVER_IMAGES, base64);
      create_object.image = path;
    }

    const { error } = await supabase.from("chats").insert(create_object);

    if (error) throw new Error(error);

    return res.status(200).json({ success: "Chat created" });
  } catch (err) {
    return res.status(400).json({ error: "Could not create chat" });
  }
});

router.delete("/delete", async (req, res) => {
  const { chat_id } = req.body;
  console.log(chat_id);

  try {
    if (!chat_id) throw new Error("No chat id provided");

    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("chat_id", chat_id);

    console.log(error);

    if (error) throw new Error("Could not delete assosciated messages");

    let err = await supabase.from("chats").delete().eq("id", chat_id);

    if (err.error) throw new Error("Could not perform delete operation");

    return res.status(200).json({ success: "Delete was successful" });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Could not delete chat", content: err });
  }
});

const explicitUsers = (chats) => {
  chats.map((chat) => {
    const users = [];
    chat.user_ids.map((id, index) => {
      users.push({
        id: parseInt(id),
        username: chat.usernames[index],
        email: chat.emails[index],
        image: chat.user_images[index],
      });
    });

    delete chat.user_ids;
    delete chat.usernames;
    delete chat.emails;
    delete chat.user_images;

    chat.users = users;
  });
};

module.exports = router;
