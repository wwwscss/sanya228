import TelegramBot from "node-telegram-bot-api";
import { Client } from "pg";
import { gerIdFromCallbackQuery } from "../../../helpers/getIdFromCallbackQuery";
import { getAllCategories } from "../../../dbQueries/categories/getAllCategories";
import { createSplitButtons } from "../../../helpers/createSplitButtons";
import { BACK_BUTTON } from "../../../buttons";
import { getAllProducts } from "../../../dbQueries/products/getAllProducts";

export const productsListCallbackQuery = (
  bot: TelegramBot,
  psqlClient: Client,
  callbackQuery: TelegramBot.CallbackQuery
) => {
  const chatId = callbackQuery.message?.chat.id as number;
  const messageId = callbackQuery.message?.message_id;
  const page = gerIdFromCallbackQuery(callbackQuery.data);

  getAllProducts(psqlClient).then((products) => {
    const buttons = createSplitButtons(
      products.map((product) => ({
        text: product.name,
        callback_data: `admin__products__edit-product#${product.id}`,
      })),
      5
    );
    bot.editMessageText("Админо4ка по продуктам", {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: {
        inline_keyboard: buttons.length
          ? [
              ...buttons[page],
              [
                {
                  text: "Добавить товар",
                  callback_data: "admin__products__add-product",
                },
              ],
              [BACK_BUTTON],
              [
                {
                  text: page === 0 ? "----" : "<---",
                  callback_data: `admin__products#${page === 0 ? 0 : page - 1}`,
                },
                { text: `Страница: ${page + 1}`, callback_data: `s` },
                {
                  text: buttons[page + 1] ? "--->" : "----",
                  callback_data: `admin__products#${
                    buttons[page + 1] ? page + 1 : page
                  }`,
                },
              ],
            ]
          : [
              [
                {
                  text: "Добавить товар",
                  callback_data: "admin__products__add-product",
                },
              ],
              [BACK_BUTTON],
            ],
      },
    });
  });
};
