import { Client } from "pg";
import { generateId } from "../../helpers/generateId";

export const createNewCategory = async (
  client: Client,
  categoryName: string
) => {
  const query = "INSERT INTO categories(id, name) VALUES($1, $2) RETURNING *";
  try {
    const res = await client.query(query, [generateId(), categoryName]);

    if (res.rows.length) {
      return true;
    }
  } catch (err) {
    console.error("Ошибка в создании категории ", err.stack);
    return false;
  }
};
