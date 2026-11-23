import { api } from "./api";
import { Product, CreateProductDto, UpdateProductDto } from "@/types/product";
import { ApiResponse } from "@/types/api";
import { initialProducts } from "./mockData";

let localProducts: Product[] = [...initialProducts];

export const productService = {
  async getProducts(): Promise<Product[]> {
    try {
      const response = await api.get<ApiResponse<Product[]>>("/store/products");
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return localProducts;
    } catch {
      return localProducts;
    }
  },

  async addProduct(dto: CreateProductDto): Promise<Product> {
    try {
      const response = await api.post<ApiResponse<Product>>("/store/products", dto);
      if (response.data?.data) {
        return response.data.data;
      }
    } catch {
      // Fallback locally
    }

    const newProduct: Product = {
      _id: `prod_${Date.now()}`,
      storeId: "store_001",
      name: dto.name,
      details: dto.details,
      price: Number(dto.price),
      imageUrl: dto.imageUrl || "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400&auto=format&fit=crop&q=80",
      status: "available",
      createdAt: new Date().toISOString(),
    };
    localProducts = [newProduct, ...localProducts];
    return newProduct;
  },

  async updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    try {
      const response = await api.patch<ApiResponse<Product>>(`/store/products/${id}`, dto);
      if (response.data?.data) {
        return response.data.data;
      }
    } catch {
      // Fallback locally
    }

    localProducts = localProducts.map((p) =>
      p._id === id ? { ...p, ...dto, updatedAt: new Date().toISOString() } : p
    );
    const updated = localProducts.find((p) => p._id === id);
    if (!updated) throw new Error("Product not found");
    return updated;
  },

  // Soft deactivate: switches status to 'unavailable' (NFR-06 requirement)
  async deactivateProduct(id: string): Promise<Product> {
    try {
      const response = await api.patch<ApiResponse<Product>>(`/store/products/${id}/deactivate`);
      if (response.data?.data) {
        return response.data.data;
      }
    } catch {
      // Fallback locally
    }

    localProducts = localProducts.map((p) =>
      p._id === id ? { ...p, status: "unavailable", updatedAt: new Date().toISOString() } : p
    );
    const updated = localProducts.find((p) => p._id === id);
    if (!updated) throw new Error("Product not found");
    return updated;
  },
};
