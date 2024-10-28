export const gerIdFromCallbackQuery = (query: string) =>
  parseInt(query.split("#")[1]);
