import { Client } from "pg";

const QUERY = "SELECT * FROM categories";

interface ICategoryFromDB {
  id: number;
  name: string;
}

export const getAllCategories = async (
  client: Client
): Promise<ICategoryFromDB[]> => {
  try {
    const res = await client.query(QUERY);
    console.log(res.rows);
    return res.rows;
  } catch (err: any) {
    console.error("Ошибка при проверке ID", err.stack);
  }
};
