const express = require("express");
const router = express.Router();
require("dotenv/config");
const bcrypt = require("bcryptjs");
const supabase = require("../../../utils/supabase");
const fileSaving = require("../../../utils/fileSaving");

const PROFILE_IMAGES = __dirname + "\\profile_images";

//----------------------------------------------------

router.get("/getuser", async (req, res) => {
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

    return res.json(data[0]);
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
      .limit(6);

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

// router.put("/modify", async (req, res) => {
//   const { user_id, base64, username, password } = req.body;

//   try {
//     let update_object = {};
//     if (base64) {
//       const path = await fileSaving.writeToFile(PROFILE_IMAGES, base64);
//       update_object.image = path;
//     }

//     if (username) update_object.username = username;

//     if (password && password.length >= 6) {
//       const salt = await bcrypt.genSalt(10);
//       const hashed_password = await bcrypt.hash(password, salt);
//       update_object.password = hashed_password;
//     }

//     const { error } = await supabase
//       .from("users")
//       .update(update_object)
//       .eq("id", user_id);

//     if (error) throw new Error("could not update user");

//     return res.status(200).json({ success: "Update successful" });
//   } catch (err) {
//     return res
//       .status(500)
//       .json({ error: "Error saving profile data", content: err });
//   }
// });

// ----------------------------------------------------
router.put("/changeusername", async (req, res) => {
  const { finalName, user_id } = req.body;
  console.log(finalName, user_id);

  try {
    if (!finalName || !user_id) throw new Error("Not enough input arguments");

    const { error } = await supabase
      .from("users")
      .update({
        username: finalName,
      })
      .eq("id", user_id);

    if (error) throw new Error("Error updating username");

    return res.status(200).json({ success: "Username updated" });
  } catch (err) {
    return res.status(500).json({ error: "Could not update username" });
  }
});

// ----------------------------------------------------
router.put("/change_profile_image", async (req, res) => {
  const { finalImage, user_id } = req.body;

  try {
    if (!user_id) throw new Error("Not enough input arguments");

    const image_select = await supabase
      .from("users")
      .select("image")
      .eq("id", user_id);

    if (image_select.error) throw new Error("Could not swap image");

    const img = image_select.data[0].image;
    if (img) fileSaving.removeFile(PROFILE_IMAGES, img);

    let path = null;
    if (finalImage) {
      path = await fileSaving.writeToFile(PROFILE_IMAGES, finalImage);
    }
    const { error } = await supabase
      .from("users")
      .update({ image: path })
      .eq("id", user_id);

    if (error) throw new Error("Error updating profile picture");

    return res.status(200).json({ success: "Profile picture updated" });
  } catch (err) {
    return res.status(500).json({ error: "Could not update image" });
  }
});

// ------------------------------------------------------
router.put("/change_password", async (req, res) => {
  const { finalPassword, user_id } = req.body;

  try {
    if (!finalPassword || finalPassword.length < 6 || !user_id)
      throw new Error("Not enough input arguments");

    const salt = await bcrypt.genSalt(10);
    const hashed_password = await bcrypt.hash(finalPassword, salt);

    const { error } = await supabase
      .from("users")
      .update({
        password: hashed_password,
      })
      .eq("id", user_id);

    if (error) throw new Error("Error updating password");

    return res.status(200).json({ success: "Password updated" });
  } catch (err) {
    return res.status(500).json({ error: "Could not update password" });
  }
});

module.exports = router;
