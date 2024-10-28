import TelegramBot from "node-telegram-bot-api";
import { psqlClient } from "../constants/psqlClient";

export const init = () => {
  require("dotenv").config();

  const { tgApiToken } = process.env;

  if (tgApiToken) {
    const bot = new TelegramBot(tgApiToken, { polling: true });
    psqlClient
      .connect()
      .then(() => console.log("Подключился к базе"))
      .catch((err: any) => console.log(`Ошибка при подключении к базе ${err}`));
    return { psqlClient, bot };
  } else {
    console.log("Укажите в .env tgApiToken");
    process.exit();
  }
};
