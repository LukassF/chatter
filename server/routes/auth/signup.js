const express = require("express");
const router = express.Router();
require("dotenv/config");
const bcrypt = require("bcryptjs");

const supabase = require("../../utils/supabase");

router.post("/", async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  if (!username || !email || !password) {
    res.status(400).json({ error: "Fill in all fields" });
    return;
  }

  if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    res.status(400).json({ error: "Email is invalid" });
    return;
  }

  const takenEmail = await isEmailTaken(email);
  if (takenEmail.data.length > 0) {
    res.status(400).json({ error: "Email is taken" });
    return;
  }

  const takenUsername = await isUsernameTaken(username);
  if (takenUsername.data.length > 0) {
    res.status(400).json({ error: "Username is taken" });
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashed_password = await bcrypt.hash(password, salt);

  const insertion = await insertData(username, email, hashed_password);
  res.json(insertion);
});

// router.get("/:id", async (req, res) => {
//   const id = req.params.id;
//   const { data, error } = await supabase.from("clothes").select().eq("id", id);
//   if (error) res.status(500).json(error);
//   else res.json(data);
// });

const isEmailTaken = async (email) => {
  return await supabase.from("users").select().eq("email", email);
};

const isUsernameTaken = async (username) => {
  return await supabase.from("users").select().eq("username", username);
};

const insertData = async (username, email, password) => {
  return await supabase.from("users").insert({ username, email, password });
};

module.exports = router;
