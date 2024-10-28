import { Client } from "pg";
import { getProductById } from "./getProductById";
import { deleteFiles } from "../../helpers/deleteFiles";

export const deleteProduct = async (client: Client, id: number) => {
  try {
    getProductById(client, id).then((product) => {
      deleteFiles(product?.photoPaths).then((isPhotoDeleted) => {
        if (isPhotoDeleted) {
          console.log(isPhotoDeleted, "isPhotoDeleted");
          const query = "DELETE FROM products WHERE id = $1";

          const values = [id];

          const res = client.query(query, values);
          console.log(`Товар ${id} успешно удален.`);
          return true;
        }
      });
    });
  } catch (err) {
    console.log(`Во время удаления товара произошла ошибка: ${err}`);
    return false;
  }
};
