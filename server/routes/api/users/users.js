const express = require("express");
const router = express.Router();
require("dotenv/config");
const bcrypt = require("bcryptjs");
const supabase = require("../../../utils/supabase");
const fileSaving = require("../../../utils/fileSaving");

const PROFILE_IMAGES = __dirname + "\\profile_images";

//----------------------------------------------------

router.get("/getimage", async (req, res) => {
  const { user } = req.user;

  try {
    const { data, error } = await supabase
      .from("users")
      .select("id,username,email,image")
      .eq("id", user.id);

    if (error) throw new Error("fetch failed");

    if (data[0].image) {
      const base64 = fileSaving.getBase64(PROFILE_IMAGES, data[0].image);
      return res.json({ ...data[0], image: base64 });
    }

    return res.json(null);
  } catch (err) {
    return res
      .status(400)
      .json({ error: "Could not fetch user", content: err });
  }
});

//----------------------------------------------------

router.get("/getusers", async (req, res) => {
  const input = req.query.input;
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id,username,email,image")
      .or(`username.ilike.%${input}%, email.ilike.%${input}%`)
      .not("id", "eq", req.user.user.id)
      .limit(5);

    if (error || data.length === 0) throw new Error(error);

    data.map((user) => {
      if (user.image)
        user.image = fileSaving.getBase64(PROFILE_IMAGES, user.image);
    });

    return res.json(data);
  } catch (err) {
    return res.status(400).json({ error: "Could not find users" });
  }
});

//----------------------------------------------------

router.put("/modify", async (req, res) => {
  const { user_id, base64, username, password } = req.body;

  try {
    let update_object = {};
    if (base64) {
      const path = await fileSaving.writeToFile(PROFILE_IMAGES, base64);
      update_object.image = path;
    }

    if (username) update_object.username = username;

    if (password && password.length >= 6) {
      const salt = await bcrypt.genSalt(10);
      const hashed_password = await bcrypt.hash(password, salt);
      update_object.password = hashed_password;
    }

    const { error } = await supabase
      .from("users")
      .update(update_object)
      .eq("id", user_id);

    if (error) throw new Error("could not update user");

    return res.status(200).json({ success: "Update successful" });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Error saving profile data", content: err });
  }
});

module.exports = router;
