import { InlineKeyboardButton } from "node-telegram-bot-api";

export const createSplitButtons = (
  buttons: InlineKeyboardButton[],
  splitNumber
) =>
  buttons.reduce((acc, item, index) => {
    const chunkIndex = Math.floor(index / splitNumber);
    if (!acc[chunkIndex]) {
      acc[chunkIndex] = [];
    }
    acc[chunkIndex].push([item]);

    return acc;
  }, []);
