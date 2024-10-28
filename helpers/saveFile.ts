import axios from "axios";
import fs from "fs";

export const saveFile = async (fileUrl, filePath) => {
  const response = await axios({
    url: fileUrl,
    method: "GET",
    responseType: "stream",
  });

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    writer.on("finish", resolve);

    writer.on("error", reject);
  });
};
