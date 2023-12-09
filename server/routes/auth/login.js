const express = require("express");
const router = express.Router();
require("dotenv/config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../../utils/supabase");

router.post("/", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  let is_email = false;

  if (!username || !password)
    return res.status(400).json({ error: "Fill in all fields" });

  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(username))
    is_email = true;

  const found_user = await findUser(username, is_email);
  if (found_user.data.length === 0)
    return res.status(400).json({ error: "User not found!" });

  const valid_password = await bcrypt.compare(
    password,
    found_user.data[0].password
  );

  if (!valid_password)
    return res.status(400).json({ error: "Invalid password!" });

  const access_token = generateAccessToken(found_user.data[0]);
  const refresh_token = generateRefreshToken(found_user.data[0]);
  const error = await insertRefreshToken(refresh_token, found_user.data[0].id);

  if (error)
    return res.status(500).json({ error: "Error updating a refresh token" });

  res.json({ access_token, refresh_token });
});

const findUser = async (username, is_email) => {
  if (!is_email)
    return await supabase.from("users").select().eq("username", username);
  else return await supabase.from("users").select().eq("email", username);
};

const generateAccessToken = (user) => {
  const token_data = {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      image: user.image,
    },
  };
  return jwt.sign(token_data, process.env.JWT_SECRET, { expiresIn: "10m" });
};

const generateRefreshToken = (user) => {
  const token_data = {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      image: user.image,
    },
  };
  return jwt.sign(token_data, process.env.REFRESH_SECRET, { expiresIn: "6h" });
};

const insertRefreshToken = async (refresh_token, user_id) => {
  try {
    const error1 = await deleteExistingRefreshToken(user_id);

    if (error1) throw new Error(error1);
    const { error2 } = await supabase
      .from("refresh_tokens")
      .insert({ refresh_token, user_id });

    if (error2) throw new Error(error2);
  } catch (err) {
    return err;
  }
};

const deleteExistingRefreshToken = async (user_id) => {
  try {
    const { error } = await supabase
      .from("refresh_tokens")
      .delete()
      .eq("user_id", user_id);

    if (error) throw new Error(error);
  } catch (err) {
    return err;
  }
};

// const getBase64 = (image) => {
//   const r_path = path.resolve("routes/api/users/profile_images");
//   const data = fs.readFileSync(`${r_path}\\${image}`);
//   const extension = image.split(".")[1];
//   const base64 = data.toString("base64");
//   return "data:image/" + extension + ";base64," + base64;
// };

module.exports = router;
