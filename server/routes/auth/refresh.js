const express = require("express");
const router = express.Router();
require("dotenv/config");
const jwt = require("jsonwebtoken");
const supabase = require("../../utils/supabase");

router.post("/", async (req, res) => {
  const refresh_token = req.body.refresh_token;

  if (!refresh_token)
    return res.status(401).json({ error: "You are not authorized" });

  const found_token = await getTokenFromDb(refresh_token);

  if (!found_token.data || found_token.data.length === 0 || found_token.error)
    return res.status(403).json({ error: "Invalid token" });

  jwt.verify(refresh_token, process.env.REFRESH_SECRET, (err, data) => {
    if (err || !data)
      return res.status(403).json({ error: "Invalid refresh token" });

    const access_token = generateAccessToken(data.user);

    return res.status(200).json({ access_token });
  });
});

const getTokenFromDb = async (refresh_token) => {
  return await supabase
    .from("refresh_tokens")
    .select()
    .eq("refresh_token", refresh_token);
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

module.exports = router;
