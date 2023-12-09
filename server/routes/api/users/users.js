const express = require("express");
const router = express.Router();
require("dotenv/config");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const supabase = require("../../../utils/supabase");

router.get("/getimage", async (req, res) => {
  const { user } = req.user;

  try {
    const { data, error } = await supabase
      .from("users")
      .select()
      .eq("id", user.id);

    if (error) throw new Error("fetch failed");

    if (data[0].image) {
      const base64 = getBase64(data[0].image);
      return res.json({ ...data[0], image: base64 });
    }

    return res.json(null);
  } catch (err) {
    return res
      .status(400)
      .json({ error: "Could not fetch user", content: err });
  }
});

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

    data.map((user) => {
      if (user.image) user.image = getBase64(user.image);
    });

    return res.json(data);
  } catch (err) {
    return res.status(400).json({ error: "Could not find users" });
  }
});

router.post("/modify", async (req, res) => {
  const { user_id, base64, username, password } = req.body;

  try {
    let update_object = {};
    if (base64) {
      const path = await writeToFile(base64);
      update_object.image = path;
    }

    if (username) update_object.username = username;

    if (password && password.length >= 6) {
      const salt = await bcrypt.genSalt(10);
      const hashed_password = await bcrypt.hash(password, salt);
      update_object.password = hashed_password;
    }

    const { error } = await supabase
      .from("users")
      .update(update_object)
      .eq("id", user_id);

    if (error) throw new Error("could not update user");

    return res.status(200).json({ success: "Update successful" });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Error saving profile data", content: err });
  }
});

const writeToFile = async (base64) => {
  const [preface, data] = base64.split(",");
  const extension = preface.split("/")[1].split(";")[0];
  const base64_data = Buffer.from(data, "base64");

  const files = await scanDir(__dirname + `\\profile_images`);

  let seed = crypto.randomBytes(20).toString("hex");
  let image_path = `${seed}.${extension}`;

  while (files.includes(image_path)) {
    seed = crypto.randomBytes(20).toString("hex");
    image_path = `${seed}.${extension}`;
  }

  for (let file of files) {
    const in_folder = fs.readFileSync(__dirname + `\\profile_images\\${file}`);
    if (Buffer.compare(in_folder, base64_data) === 0) {
      return file;
    }
  }

  try {
    fs.writeFileSync(
      __dirname + `\\profile_images\\${image_path}`,
      Buffer.from(data, "base64")
    );

    return image_path;
  } catch (err) {
    throw new Error(err);
  }
};

const scanDir = (path) => {
  return new Promise((res, rej) => {
    fs.readdir(path, (err, files) => {
      if (err) rej(err);
      if (files) res(files);
    });
  });
};

const getBase64 = (image) => {
  const data = fs.readFileSync(__dirname + `\\profile_images\\${image}`);
  const extension = image.split(".")[1];
  const base64 = data.toString("base64");
  return "data:image/" + extension + ";base64," + base64;
};

module.exports = router;
