const express = require("express");
const router = express.Router();
require("dotenv/config");
const supabase = require("../../../utils/supabase");

router.get("/getchats", async (req, res) => {
  try {
    const { data, error } = await supabase.rpc("get_chats_with_users", {
      user_id: req.user.user.id,
    });

    if (error || data.length === 0) throw new Error(error);

    explicitUsers(data);

    res.status(200).json(data);
  } catch (err) {
    return res.status(400).json({ error: "Could not get chats" });
  }
});

router.post("/createchat", async (req, res) => {
  const { name, users } = req.body;
  try {
    const { error } = await supabase
      .from("chats")
      .insert({ name, user_ids: users });

    if (error) throw new Error(error);

    return res.status(200).json({ success: "Chat created" });
  } catch (err) {
    return res.status(400).json({ error: "Could not create chat" });
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
