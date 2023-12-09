const express = require("express");
const router = express.Router();
require("dotenv/config");
const supabase = require("../../../utils/supabase");

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

    return res.json(data);
  } catch (err) {
    return res.status(400).json({ error: "Could not find users" });
  }
});

module.exports = router;
