const express = require("express");
const router = express.Router();
require("dotenv/config");
const supabase = require("../../utils/supabase");

router.post("/", async (req, res) => {
  const refresh_token = req.body.token;

  const error = await deleteFromDb(refresh_token);

  if (error)
    return res
      .status(500)
      .json({ error: "Could not delete refresh token from database" });

  res.status(200).json({ success: "You have logged out successfully" });
});

const deleteFromDb = async (refresh_token) => {
  try {
    const { error } = await supabase
      .from("refresh_token")
      .delete()
      .eq("refresh_token", refresh_token);

    if (error) throw new Error(error);
  } catch (err) {
    return err;
  }
};

module.exports = router;
