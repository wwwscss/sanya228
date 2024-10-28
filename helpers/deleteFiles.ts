import fs from "fs";
import path from "path";

export const deleteFiles = async (photoIds: string[]) => {
  return Promise.all(
    photoIds?.map(async (photoId) => {
      try {
        fs.unlink(
          path.join(__dirname, "../photoss", `${photoId}.jpg`),
          (err) => {
            if (err) throw err;
          }
        );
        return true;
      } catch {
        return false;
      }
    })
  );
};
