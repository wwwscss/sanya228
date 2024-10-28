import { Client } from "pg";

export const checkIsUserExistByChatId = async (
  chatId: number,
  client: Client
) => {
  const query = "SELECT * FROM users WHERE chatid = $1";

  const values = [chatId];

  try {
    const res = await client.query(query, values);
    console.log(res);
    if (res.rows.length > 0) {
      console.log(`ID ${chatId} существует!`);
      return true;
    } else {
      console.log(`ID ${chatId} не найден.`);
    }
  } catch (err: any) {
    console.error("Ошибка при проверке ID", err.stack);
  }
};
