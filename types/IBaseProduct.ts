export interface IBaseProduct {
  id: number;
  name: string;
  price: number;
  sale_price?: number;
  description: string;
  picture_ids: string[];
  categoryId?: number;
}
