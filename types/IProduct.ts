export interface IProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  photoPaths: string[];
  salePrice: number | null;
  categoryId: number | null;
}
