const express = require("express");
const router = express.Router();

const users_subrouter = require("./users/users");
router.use("/users", users_subrouter);

const chats_subrouter = require("./chats/chats");
router.use("/chats", chats_subrouter);

module.exports = router;
