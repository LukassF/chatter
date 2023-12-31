const express = require("express");
const app = express();
require("dotenv/config");
const bodyParser = require("body-parser");
const cors = require("cors");
app.use(cors());

const websocket = require("express-ws")(app);

app.ws("/api/messages/update", (ws, req) => {
  ws.on("message", function (msg) {
    Array.from(websocket.getWss().clients).forEach(function (client) {
      client.send(msg);
    });
  });
});

const port = process.env.PORT || "5000";

app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));

const signup_router = require("./routes/auth/signup");
app.use("/auth/signup", signup_router);

const login_router = require("./routes/auth/login");
app.use("/auth/login", login_router);

const refresh_router = require("./routes/auth/refresh");
app.use("/auth/refresh", refresh_router);

const logout_router = require("./routes/auth/logout");
app.use("/auth/logout", logout_router);

//using a middleware to check the token
const api_router = require("./routes/api/api");
const jwt_middleware = require("./routes/api/middleware");
app.use("/api", jwt_middleware, api_router);

app.listen(port, () => {
  console.log("App running on port 5000");
});
