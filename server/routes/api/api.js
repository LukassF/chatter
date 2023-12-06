const express = require("express");
const router = express.Router();
require("dotenv/config");
const supabase = require("../../utils/supabase");

router.get("/users", async (req, res) => {
  const input = req.query.input;
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id,username,email")
      .or(`username.ilike.%${input}%, email.ilike.%${input}%`)
      .not("id", "eq", req.user.user.id)
      .limit(5);

    if (error || data.length === 0) throw new Error(error);

    return res.json(data);
  } catch (err) {
    return res.status(400).json({ error: "Could not find users" });
  }
});

router.get("/getchats", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("chats")
      .select()
      .overlaps("user_ids", [req.user.user.id]);

    if (error || data.length === 0) throw new Error(error);

    res.json(data);
  } catch (err) {
    return res.status(400).json({ error: "Could not get chats" });
  }
});

// router.post("/", async (req, res) => {
//   const username = req.body.username;
//   const email = req.body.email;
//   const password = req.body.password;

//   if (!username || !email || !password)
//     return res.status(400).json({ error: "Fill in all fields" });

//   if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
//     return res.status(400).json({ error: "Email is invalid" });

//   const takenEmail = await isEmailTaken(email);
//   if (takenEmail.data.length > 0)
//     return res.status(400).json({ error: "Email is taken" });

//   const takenUsername = await isUsernameTaken(username);
//   if (takenUsername.data.length > 0)
//     return res.status(400).json({ error: "Username is taken" });

//   const salt = await bcrypt.genSalt(10);
//   const hashed_password = await bcrypt.hash(password, salt);

//   const insertion = await insertData(username, email, hashed_password);
//   res.json(insertion);
// });

// // router.get("/:id", async (req, res) => {
// //   const id = req.params.id;
// //   const { data, error } = await supabase.from("clothes").select().eq("id", id);
// //   if (error) res.status(500).json(error);
// //   else res.json(data);
// // });

// const isEmailTaken = async (email) => {
//   return await supabase.from("users").select().eq("email", email);
// };

// const isUsernameTaken = async (username) => {
//   return await supabase.from("users").select().eq("username", username);
// };

// const insertData = async (username, email, password) => {
//   return await supabase.from("users").insert({ username, email, password });
// };

module.exports = router;
