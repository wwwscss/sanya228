import { Client } from "pg";
import { IProduct } from "../../types/IProduct";
const query =
  "INSERT INTO public.products ( id, name, price, sale_price, description, picture_ids, category_id) VALUES($1, $2, $3, $4, $5, $6, $7)";

export const createNewProduct = async (
  client: Client,
  { id, name, description, price, photoPaths, salePrice, categoryId }: IProduct
) => {
  try {
    const res = await client.query(query, [
      id,
      name,
      price,
      salePrice,
      description,
      photoPaths,
      categoryId,
    ]);

    return true;
  } catch (err) {
    console.error("Ошибка в создании категории ", err.stack);
    return false;
  }
};
