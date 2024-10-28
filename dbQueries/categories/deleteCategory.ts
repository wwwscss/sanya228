import { Client } from "pg";

export const deleteCategory = async (client: Client, id: number) => {
  try {
    const query = "DELETE FROM categories WHERE id = $1";

    const values = [id];

    const res = await client.query(query, values);
    return true;
  } catch (err) {
    return false;
  }
};
