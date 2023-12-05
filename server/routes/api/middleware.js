const jwt = require("jsonwebtoken");
require("dotenv/config");

module.exports = (req, res, next) => {
  const auth_header = req.headers["authorization"];

  if (!auth_header)
    return res.status(401).json({ error: "You are not authorized" });

  const token = auth_header.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
    if (err) return res.status(403).json({ error: "Token invalid" });

    req.user = data;
    next();
  });
};
