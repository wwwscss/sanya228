import { Client } from "pg";

export const changeNameOfProduct = async (
  client: Client,
  id: number,
  productName: string
) => {
  const query = "UPDATE products SET name = $1 WHERE id = $2";
  try {
    const res = await client.query(query, [productName, id]);
    console.log("Товар успешно переименован");
    return true;
  } catch (err) {
    console.error(`Ошибка в переименовании товара #{err}`);
    return false;
  }
};
