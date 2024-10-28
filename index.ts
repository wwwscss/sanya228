import { InlineKeyboardMarkup } from "node-telegram-bot-api";
import { BACK_BUTTON, START_BUTTONS } from "./buttons";
import { checkIsUserExistByChatId } from "./dbQueries/check/checkIsUserExistByChatId";
import { getAllCategories } from "./dbQueries/categories/getAllCategories";
const adminChatId = [1055716893, 1892788343];
const path = require("path");
import { insertUser } from "./dbQueries/insert/insertUser";
import { init } from "./helpers/init";
import { createNewCategory } from "./dbQueries/categories/createNewCategory";
import { createSplitButtons } from "./helpers/createSplitButtons";
import { deleteCategory } from "./dbQueries/categories/deleteCategory";
import { changeNameOfCategory } from "./dbQueries/categories/changeNameOfCategory";
import { categoriesListCallbackQuery } from "./callbackQueries/admin/categories/categoriesList";
import { productsListCallbackQuery } from "./callbackQueries/admin/products/productsListCallbackQuery";
import { saveFile } from "./helpers/saveFile";
import { generateId } from "./helpers/generateId";
import { createNewProduct } from "./dbQueries/products/createNewProduct";
import { IProduct } from "./types/IProduct";
import { deleteProduct } from "./dbQueries/products/deleteProduct";
import { changeNameOfProduct } from "./dbQueries/products/changeNameOfProduct";
require("dotenv").config();
const { psqlClient, bot } = init();

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  console.log(chatId);
  if (text === "/start") {
    checkIsUserExistByChatId(chatId, psqlClient).then((isExist) => {
      if (!isExist) {
        insertUser(chatId, msg.chat.first_name || "", psqlClient);
      } else {
        //TODO добавить ласт онлайн хотя это можно сделать на каждый ивент
        console.log("Пользователь уже в базе");
      }
      bot.sendMessage(chatId, "Главное меню", {
        reply_markup: {
          inline_keyboard: [
            adminChatId.includes(chatId)
              ? START_BUTTONS
              : START_BUTTONS.filter((button) => !button.allowToAdmin),
          ],
        },
      });
    });
  }
  // // send a message to the chat acknowledging receipt of their message
  // bot.sendMessage(chatId, "Received your message");
});
type action = "start" | "links" | "products" | "about_us" | "admin";

bot.on("callback_query", (callbackQuery) => {
  const chatId = callbackQuery.message?.chat.id as number;
  const messageId = callbackQuery.message?.message_id;
  const action = callbackQuery.data;
  console.log(chatId);
  // Ответ на нажатие кнопки
  if (action === "start") {
    checkIsUserExistByChatId(chatId, psqlClient).then((isExist) => {
      if (!isExist) {
        insertUser(
          chatId,
          callbackQuery.message?.chat.first_name || "",
          psqlClient
        );
      } else {
        //TODO добавить ласт онлайн хотя это можно сделать на каждый ивент
        console.log("Пользователь уже в базе");
      }
      bot.editMessageText("Главное меню", {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
          inline_keyboard: [
            adminChatId.includes(chatId)
              ? START_BUTTONS
              : START_BUTTONS.filter((button) => !button.allowToAdmin),
          ],
        },
      });
    });
  }
  if (action === "links" || action === "about_us") {
    const text = action === "links" ? "Ссылки" : "О нас";

    bot.editMessageText(text, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: { inline_keyboard: [[BACK_BUTTON]] },
    });
  }
  if (action === "products") {
    getAllCategories(psqlClient).then((categories) => {
      if (categories.length) {
        bot.editMessageText("Выберите категорию", {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [
                ...categories.map((category) => ({
                  text: category.name,
                  callback_data: `category${category.id}`,
                })),
                { text: "Без категорий", callback_data: "categoryNo" },
              ],
              [BACK_BUTTON],
            ],
          },
        });
      } else {
        bot.editMessageText("Увы категорий нет", {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: { inline_keyboard: [[BACK_BUTTON]] },
        });
      }
    });
  }
  if (action === "admin") {
    bot.editMessageText("Админо4ка", {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Категории", callback_data: "admin__category#0" },
            { text: "Пользователи", callback_data: "admin_users" },
            { text: "Товары", callback_data: "admin__products#0" },
          ],
          [BACK_BUTTON],
        ],
      },
    });
  }

  if (action.includes("admin__category#")) {
    categoriesListCallbackQuery(bot, psqlClient, callbackQuery);
  }

  if (action === "admin__category__add-category") {
    bot
      .sendMessage(chatId, "Введите название категории:", {
        reply_markup: {
          force_reply: true,
        },
      })
      .then((sentMessage) => {
        bot.onReplyToMessage(chatId, sentMessage.message_id, (msg) => {
          createNewCategory(psqlClient, msg.text).then((res) => {
            bot.deleteMessage(chatId, sentMessage.message_id);
            bot.deleteMessage(chatId, msg.message_id);
            bot.editMessageText(
              res
                ? `Категория "${msg.text}" успешно создана.`
                : `Категория "${msg.text}" не была создана, попробуйте еще раз, возможно название не адекватно)`,
              {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: "Назад к категориям",
                        callback_data: "admin__category#0",
                      },
                    ],
                  ],
                },
              }
            );
          });
        });
      });
  }
  if (action.includes("admin__category__edit-category#")) {
    const categoryId = parseInt(action.split("#")[1]);
    bot.editMessageText("Что сделать", {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Удалить категорию",
              callback_data: `admin__category__delete-category#${categoryId}`,
            },
          ],
          [
            {
              text: "Изменить название категории",
              callback_data: `admin__category__edit-category-name#${categoryId}`,
            },
          ],
          [
            {
              text: "Назад",
              callback_data: "admin__category#0",
            },
          ],
        ],
      },
    });
  }
  if (action.includes("admin__category__delete-category#")) {
    const categoryId = parseInt(action.split("#")[1]);
    deleteCategory(psqlClient, categoryId).then((res) => {
      bot.editMessageText(
        res
          ? `Категория успешно удалена.`
          : `Категория не была удалена, хз баг какой та, Саня напиши проверим`,
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Назад к категориям",
                  callback_data: "admin__category#0",
                },
              ],
            ],
          },
        }
      );
    });
  }
  if (action.includes("admin__category__edit-category-name#")) {
    const categoryId = parseInt(action.split("#")[1]);
    bot
      .sendMessage(chatId, "Введите новое название категории:", {
        reply_markup: {
          force_reply: true,
        },
      })
      .then((sentMessage) => {
        bot.onReplyToMessage(chatId, sentMessage.message_id, (msg) => {
          changeNameOfCategory(psqlClient, categoryId, msg.text).then((res) => {
            bot.deleteMessage(chatId, sentMessage.message_id);
            bot.deleteMessage(chatId, msg.message_id);
            bot.editMessageText(
              res
                ? `Успешно изменили "${msg.text}" название категории.`
                : `Название поменять не получилось(`,
              {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: "Назад к категориям",
                        callback_data: "admin__category#0",
                      },
                    ],
                  ],
                },
              }
            );
          });
        });
      });
  }
  if (action.includes("admin__products#")) {
    productsListCallbackQuery(bot, psqlClient, callbackQuery);
  }
  if (action === "admin__products__add-product") {
    const product: IProduct = {
      id: generateId(),
      name: null,
      description: null,
      price: null,
      salePrice: null,
      photoPaths: null,
      categoryId: null,
    };

    bot
      .sendMessage(chatId, "Введите название товара:", {
        reply_markup: {
          force_reply: true,
        },
      })
      .then((sentMessage) => {
        bot.onReplyToMessage(
          chatId,
          sentMessage.message_id,
          (productNameMessage) => {
            product.name = productNameMessage.text;

            bot.deleteMessage(chatId, sentMessage.message_id);
            bot.deleteMessage(chatId, productNameMessage.message_id);

            bot
              .sendMessage(chatId, "Введите описание товара", {
                reply_markup: {
                  force_reply: true,
                },
              })
              .then((sentMessage) => {
                bot.onReplyToMessage(
                  chatId,
                  sentMessage.message_id,
                  (productDescriptionMessage) => {
                    product.description = productDescriptionMessage.text;

                    bot.deleteMessage(chatId, sentMessage.message_id);
                    bot.deleteMessage(
                      chatId,
                      productDescriptionMessage.message_id
                    );

                    bot
                      .sendMessage(chatId, "Введите цену товара", {
                        reply_markup: {
                          force_reply: true,
                        },
                      })
                      .then((sentMessage) => {
                        bot.onReplyToMessage(
                          chatId,
                          sentMessage.message_id,
                          (productPriceMessage) => {
                            product.price = parseInt(productPriceMessage.text);

                            bot.deleteMessage(chatId, sentMessage.message_id);
                            bot.deleteMessage(
                              chatId,
                              productPriceMessage.message_id
                            );

                            bot
                              .sendMessage(chatId, "Отправьте фото", {
                                reply_markup: {
                                  force_reply: true,
                                },
                              })
                              .then((sentMessage) => {
                                bot.onReplyToMessage(
                                  chatId,
                                  sentMessage.message_id,
                                  async (productPhotoMessage) => {
                                    const photos = productPhotoMessage.photo;
                                    console.log(
                                      productPhotoMessage,
                                      "photo11111111111111111111"
                                    );
                                    if (photos && photos.length > 0) {
                                      const photoIds = photos.map(
                                        (photo) => photo.file_id
                                      );
                                      const photoPaths = [];
                                      // for (const [
                                      //   index,
                                      //   photoId,
                                      // ] of photoIds.entries()) {
                                      try {
                                        const file = await bot.getFile(
                                          photoIds[photoIds.length - 1]
                                        );
                                        const photoIdToSave = generateId();
                                        const filePath = path.join(
                                          __dirname,
                                          "photos",
                                          `${photoIdToSave}.jpg`
                                        ); // Относительный путь

                                        // Ссылка на файл

                                        const fileUrl = `https://api.telegram.org/file/bot${process.env.tgApiToken}/${file.file_path}`;

                                        // Сохраняем файл

                                        await saveFile(fileUrl, filePath);
                                        photoPaths.push(photoIdToSave);
                                        product.photoPaths = photoPaths;
                                        console.log(
                                          `Фотография сохранена: ${filePath}`
                                        );
                                      } catch (error) {
                                        console.error(
                                          "Ошибка при обработке фотографии:",
                                          error
                                        );
                                        //   }
                                      }
                                    } else {
                                      console.log(
                                        "Нет фотографий в сообщении."
                                      );
                                    }
                                    try {
                                      bot.deleteMessage(
                                        chatId,
                                        sentMessage.message_id
                                      );
                                      bot.deleteMessage(
                                        chatId,
                                        productPhotoMessage.message_id
                                      );
                                    } catch (error) {
                                      console.log("a");
                                    }

                                    createNewProduct(psqlClient, product).then(
                                      (res) => {
                                        if (res) {
                                          bot.editMessageText(
                                            res
                                              ? `Товар успешно создан`
                                              : `Произошла ошибка`,
                                            {
                                              chat_id: chatId,
                                              message_id: messageId,
                                              reply_markup: {
                                                inline_keyboard: [
                                                  [
                                                    {
                                                      text: "Назад к товарам",
                                                      callback_data:
                                                        "admin__products#0",
                                                    },
                                                  ],
                                                ],
                                              },
                                            }
                                          );
                                        }
                                      }
                                    );
                                  }
                                );
                              });
                          }
                        );
                      });
                  }
                );
              });
          }
        );
      });
  }

  if (action.includes("admin__products__edit-product#")) {
    const productId = parseInt(action.split("#")[1]);
    bot.editMessageText("Что сделать", {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Удалить товар",
              callback_data: `admin__products__delete-product#${productId}`,
            },
          ],
          [
            {
              text: "Изменить название товара",
              callback_data: `admin__products__edit-product-name#${productId}`,
            },
          ],
          [
            {
              text: "Изменить цену товара",
              callback_data: `admin__products__edit-product-price#${productId}`,
            },
          ],
          [
            {
              text: "Изменить скидку товара",
              callback_data: `admin__products__edit-product-sale-price#${productId}`,
            },
          ],
          [
            {
              text: "Изменить фотографии товара",
              callback_data: `admin__products__edit-product-pictures#${productId}`,
            },
          ],
          [
            {
              text: "Назад",
              callback_data: "admin__products#0",
            },
          ],
        ],
      },
    });
  }
  if (action.includes("admin__products__delete-product#")) {
    const productId = parseInt(action.split("#")[1]);
    deleteProduct(psqlClient, productId).then((res) => {
      bot.editMessageText(
        res
          ? `Товар успешно удалеа.`
          : `Товар не был удален, хз баг какой то, Саня напиши проверим`,
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Назад к продуктам",
                  callback_data: "admin__products#0",
                },
              ],
            ],
          },
        }
      );
    });
  }
  if (action.includes("admin__products__edit-product-name#")) {
    const productId = parseInt(action.split("#")[1]);
    bot
      .sendMessage(chatId, "Введите новое название товара:", {
        reply_markup: {
          force_reply: true,
        },
      })
      .then((sentMessage) => {
        bot.onReplyToMessage(chatId, sentMessage.message_id, (msg) => {
          changeNameOfProduct(psqlClient, productId, msg.text).then((res) => {
            bot.deleteMessage(chatId, sentMessage.message_id);
            bot.deleteMessage(chatId, msg.message_id);
            bot.editMessageText(
              res
                ? `Успешно изменили "${msg.text}" название категории.`
                : `Название поменять не получилось(`,
              {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: "Назад к товарам",
                        callback_data: "admin__products#0",
                      },
                    ],
                  ],
                },
              }
            );
          });
        });
      });
  }
});
