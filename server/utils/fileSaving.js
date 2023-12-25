const crypto = require("crypto");
const fs = require("fs");

const writeToFile = async (folder_name, base64, type = null) => {
  const [preface, data] = base64.split(",");
  const extension = preface.split("/")[1].split(";")[0];
  const base64_data = Buffer.from(data, "base64");

  const files = await scanDir(folder_name);

  let seed = crypto.randomBytes(20).toString("hex");
  let image_path = `${seed}.${extension}`;

  while (files.includes(image_path)) {
    seed = crypto.randomBytes(20).toString("hex");
    image_path = `${seed}.${extension}`;
  }

  if (type == "message")
    for (let file of files) {
      const in_folder = fs.readFileSync(`${folder_name}\\${file}`);
      if (Buffer.compare(in_folder, base64_data) === 0) {
        return file;
      }
    }

  try {
    fs.writeFileSync(
      `${folder_name}\\${image_path}`,
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

const getBase64 = (folder_name, image) => {
  if (!image || !folder_name) return null;
  const data = fs.readFileSync(`${folder_name}\\${image}`);
  if (!data) return null;
  const extension = image.split(".")[1];
  const base64 = data.toString("base64");
  return "data:image/" + extension + ";base64," + base64;
};

const removeFile = (folder_name, image) => {
  fs.unlinkSync(`${folder_name}\\${image}`);
};

module.exports = {
  writeToFile,
  scanDir,
  getBase64,
  removeFile,
};
