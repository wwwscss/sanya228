import { Client } from "pg";

export const changeNameOfCategory = async (
  client: Client,
  id: number,
  categoryName: string
) => {
  const query = "UPDATE categories SET name = $1 WHERE id = $2";
  try {
    const res = await client.query(query, [categoryName, id]);

    return true;
  } catch (err) {
    console.error("Ошибка в переименовании ", err.stack);
    return false;
  }
};
