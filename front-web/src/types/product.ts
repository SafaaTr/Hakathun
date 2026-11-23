export type ProductStatus = 'available' | 'unavailable';

export interface Product {
  _id: string;
  storeId: string;
  name: string;
  details: string;
  price: number;
  imageUrl: string;
  status: ProductStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductDto {
  name: string;
  details: string;
  price: number;
  imageUrl: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  status?: ProductStatus;
}
