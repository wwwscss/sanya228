import { Client, DatabaseError } from "pg";

export const insertUser = async (
  chatId: number,
  userName: string,
  client: Client
) => {
  const query =
    "INSERT INTO users(userName, chatId, lastOnline) VALUES($1, $2, $3) RETURNING *";

  const date = new Date().toISOString();
  const values = [userName, chatId, date];

  try {
    const res = await client.query(query, values);
    console.log("Пользователь добавлен:", res.rows[0]);
  } catch (err: any) {
    console.error("Ошибка добавления пользователя", err.stack);
  }
};
