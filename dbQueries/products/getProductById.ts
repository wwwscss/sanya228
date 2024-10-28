const query = "SELECT * FROM products WHERE id = $1";
import { Client } from "pg";
import { IProduct } from "../../types/IProduct";
import { IBaseProduct } from "../../types/IBaseProduct";

export const getProductById = async (
  client: Client,
  id: number
): Promise<IProduct | null> => {
  const product = await client.query<IBaseProduct>(query, [id]).then((res) => {
    if (res.rowCount) {
      const product = res.rows[0];
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        photoPaths: product.picture_ids,
        salePrice: product.sale_price,
        categoryId: product.categoryId,
      };
    }
    return null;
  });
  return product;
};
