import { InlineKeyboardButton, KeyboardButton } from "node-telegram-bot-api";

interface IButton extends InlineKeyboardButton {
  allowToAdmin?: boolean;
}

export const START_BUTTONS: IButton[] = [
  {
    text: "Ссылки",
    callback_data: "links",
  },
  {
    text: "О нас",
    callback_data: "about_us",
  },
  {
    text: "Товары",
    callback_data: "products",
  },
  {
    text: "Админка",
    callback_data: "admin",
    allowToAdmin: true,
  },
];

export const BACK_BUTTON: IButton = {
  text: "Назад",
  callback_data: "start",
};
