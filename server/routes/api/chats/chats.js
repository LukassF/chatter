const express = require("express");
const router = express.Router();
require("dotenv/config");
const supabase = require("../../../utils/supabase");
const fileSaving = require("../../../utils/fileSaving");

const COVER_IMAGES = __dirname + "\\cover_images";

router.put("/modify", async (req, res) => {
  const {
    chat_id,
    message,
    base64,
    name,
    users,
    added_users = [],
    removed_users = [],
  } = req.body;

  users.sort((a, b) => Number(a) - Number(b));

  try {
    let update_object = {};

    const chat_select = await supabase
      .from("chats")
      .select("user_ids,have_seen")
      .eq("id", chat_id);

    if (chat_select.error) throw new Error("Error querying chat");
    const { user_ids, have_seen } = chat_select.data[0];

    if (have_seen && have_seen.length > 0) {
      let new_have_seen = Array(users.length).fill(null);

      users.length > 0 &&
        users.forEach((user, i) => {
          let index = user_ids.indexOf(Number(user));

          if (index >= 0) new_have_seen[i] = have_seen[index];
        });

      update_object.have_seen = new_have_seen;
    }

    if (base64) {
      const path = await fileSaving.writeToFile(COVER_IMAGES, base64);
      update_object.image = path;
    }

    if (name) update_object.name = name;

    if (users.length > 1) update_object.user_ids = users;

    update_object.updated_at = new Date();

    let all_messages = [message, ...added_users, ...removed_users];
    all_messages = all_messages.filter((item) => item);

    const { data, error } = await supabase
      .from("messages")
      .insert(all_messages)
      .select("id");

    if (error) throw new Error("Could not send assosciated messages");

    if (data.length > 0) update_object.last_message = data.pop().id;

    const chat_update = await supabase
      .from("chats")
      .update(update_object)
      .eq("id", chat_id);

    if (chat_update.error) throw new Error("Could not update chat");

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

  users.sort((a, b) => Number(a) - Number(b));

  try {
    if (!name || !users || users.length < 2)
      throw new Error("Insufficient paramters");

    let create_object = { name, user_ids: users, image: null };

    if (base64) {
      const path = await fileSaving.writeToFile(COVER_IMAGES, base64);
      create_object.image = path;
    }

    const have_seen = Array(users.length).fill(null);
    create_object.have_seen = have_seen;

    create_object.content = "New chat created.";

    const { data, error } = await supabase.rpc(
      "create_chat_and_message",
      create_object
    );
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

router.patch("/toggleseen/:user_id", async (req, res) => {
  const user_id = Number(req.params.user_id);
  const { chat_id } = req.body;

  try {
    if (!user_id || !chat_id) throw new Error("No id provided");

    const { data, error } = await supabase
      .from("chats")
      .select("user_ids,last_message")
      .eq("id", chat_id);

    if (error) throw new Error("Error querying requested chat");

    const { user_ids, last_message } = data[0];

    let curr_user_idx = user_ids.indexOf(user_id);

    const chat_update = await supabase.rpc("update_seen_value", {
      chat_id: chat_id,
      index: curr_user_idx + 1,
      new_value: last_message,
    });

    if (chat_update.error) throw new Error("Could not update chat");

    return res.status(200).json({ last_message });
  } catch (err) {
    return res.status(500).json({
      error: "Something went wrong when reading messages",
      content: err,
    });
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
        has_seen: chat.have_seen ? chat.have_seen[index] : null,
      });
    });

    delete chat.user_ids;
    delete chat.usernames;
    delete chat.emails;
    delete chat.user_images;
    delete chat.have_seen;

    chat.users = users;
  });
};

module.exports = router;
