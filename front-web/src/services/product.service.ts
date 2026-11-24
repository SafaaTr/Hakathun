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
    const numericPrice = Number(dto.price);
    const sanitizedDto = {
      ...dto,
      price: isNaN(numericPrice) ? 0 : numericPrice,
    };

    try {
      const response = await api.patch<ApiResponse<Product>>(`/store/products/${id}`, sanitizedDto);
      const resData = response.data?.data || response.data;
      if (resData && typeof resData === "object" && "name" in resData) {
        const prod: Product = {
          _id: (resData as any)._id || id,
          storeId: (resData as any).storeId || "store_001",
          name: (resData as any).name || sanitizedDto.name || "",
          details: (resData as any).details || sanitizedDto.details || "",
          price: Number((resData as any).price ?? sanitizedDto.price ?? 0),
          imageUrl: (resData as any).imageUrl || sanitizedDto.imageUrl || "",
          status: (resData as any).status || "available",
          updatedAt: new Date().toISOString(),
        };
        localProducts = localProducts.map((p) => (p._id === id ? prod : p));
        return prod;
      }
    } catch {
      // Fallback locally
    }

    localProducts = localProducts.map((p) =>
      p._id === id
        ? {
            ...p,
            ...sanitizedDto,
            price: Number(sanitizedDto.price ?? p.price ?? 0),
            updatedAt: new Date().toISOString(),
          }
        : p
    );
    const updated = localProducts.find((p) => p._id === id);
    if (!updated) {
      return {
        _id: id,
        storeId: "store_001",
        name: sanitizedDto.name || "Product",
        details: sanitizedDto.details || "",
        price: Number(sanitizedDto.price ?? 0),
        imageUrl: sanitizedDto.imageUrl || "",
        status: "available",
      };
    }
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
