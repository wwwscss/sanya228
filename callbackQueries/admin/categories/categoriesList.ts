import { Client } from "pg";
import TelegramBot from "node-telegram-bot-api";

import { getAllCategories } from "../../../dbQueries/categories/getAllCategories";
import { createSplitButtons } from "../../../helpers/createSplitButtons";
import { BACK_BUTTON } from "../../../buttons";
import { gerIdFromCallbackQuery } from "../../../helpers/getIdFromCallbackQuery";

export const categoriesListCallbackQuery = (
  bot: TelegramBot,
  psqlClient: Client,
  callbackQuery: TelegramBot.CallbackQuery
) => {
  const chatId = callbackQuery.message?.chat.id as number;
  const messageId = callbackQuery.message?.message_id;
  const page = gerIdFromCallbackQuery(callbackQuery.data);

  getAllCategories(psqlClient).then((categories) => {
    const buttons = createSplitButtons(
      categories.map((category) => ({
        text: category.name,
        callback_data: `admin__category__edit-category#${category.id}`,
      })),
      5
    );

    bot.editMessageText("Админо4ка по категориям", {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: {
        inline_keyboard: buttons.length
          ? [
              ...buttons[page],
              [
                {
                  text: "Добавить категорию",
                  callback_data: "admin__category__add-category",
                },
              ],
              [BACK_BUTTON],
              [
                {
                  text: page === 0 ? "----" : "<---",
                  callback_data: `admin__category#${page === 0 ? 0 : page - 1}`,
                },
                { text: `Страница: ${page + 1}`, callback_data: `s` },
                {
                  text: buttons[page + 1] ? "--->" : "----",
                  callback_data: `admin__category#${
                    buttons[page + 1] ? page + 1 : page
                  }`,
                },
              ],
            ]
          : [
              [
                {
                  text: "Добавить категорию",
                  callback_data: "admin__category__add-category",
                },
              ],
              [BACK_BUTTON],
            ],
      },
    });
  });
};
