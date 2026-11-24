import { api } from "./api";
import { Product, CreateProductDto, UpdateProductDto } from "@/types/product";
import { ApiResponse } from "@/types/api";
import { initialProducts } from "./mockData";

function getStoredProducts(): Product[] {
  if (typeof window === "undefined") return [...initialProducts];
  try {
    const raw = localStorage.getItem("rafeeq_store_products");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [...initialProducts];
}

function saveStoredProducts(list: Product[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("rafeeq_store_products", JSON.stringify(list));
  } catch {}
}

let localProducts: Product[] = getStoredProducts();

export const productService = {
  async getProducts(): Promise<Product[]> {
    try {
      const response = await api.get<ApiResponse<any[]>>("/store/products");
      const list = response.data?.data || response.data;
      if (Array.isArray(list) && list.length > 0) {
        // Map backend products from MongoDB
        const backendProducts: Product[] = list.map((p: any) => ({
          _id: p._id || p.id,
          storeId: p.storeId?._id || p.storeId || "store_001",
          name: p.name || "Product",
          details: p.details || "",
          price: Number(p.price) || 0,
          imageUrl: p.imageUrl || "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400&auto=format&fit=crop&q=80",
          status: p.status || "available",
          createdAt: p.createdAt || new Date().toISOString(),
          updatedAt: p.updatedAt,
        }));

        // Merge backend products with any locally added ones
        const merged = [...backendProducts];
        localProducts.forEach((lp) => {
          if (!merged.some((mp) => mp._id === lp._id || mp.name === lp.name)) {
            merged.push(lp);
          }
        });

        localProducts = merged;
        saveStoredProducts(merged);
        return merged;
      }
    } catch {
      // Fallback to stored products
    }

    localProducts = getStoredProducts();
    return localProducts;
  },

  async addProduct(dto: CreateProductDto): Promise<Product> {
    const numericPrice = Number(dto.price) || 0;
    const finalImageUrl =
      dto.imageUrl?.trim() ||
      "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400&auto=format&fit=crop&q=80";

    try {
      const response = await api.post<ApiResponse<any>>("/store/products", {
        name: dto.name.trim(),
        details: dto.details.trim(),
        price: numericPrice,
        imageUrl: finalImageUrl,
      });

      const resData = response.data?.data || response.data;
      if (resData && (resData._id || resData.name)) {
        const createdFromBackend: Product = {
          _id: resData._id || `prod_${Date.now()}`,
          storeId: resData.storeId || "store_001",
          name: resData.name || dto.name,
          details: resData.details || dto.details,
          price: Number(resData.price) || numericPrice,
          imageUrl: resData.imageUrl || finalImageUrl,
          status: resData.status || "available",
          createdAt: resData.createdAt || new Date().toISOString(),
        };

        localProducts = [createdFromBackend, ...localProducts.filter((p) => p._id !== createdFromBackend._id)];
        saveStoredProducts(localProducts);
        return createdFromBackend;
      }
    } catch (err: any) {
      console.warn("Backend addProduct fallback to local persistence:", err?.message);
    }

    const newProduct: Product = {
      _id: `prod_${Date.now()}`,
      storeId: "store_001",
      name: dto.name.trim(),
      details: dto.details.trim(),
      price: numericPrice,
      imageUrl: finalImageUrl,
      status: "available",
      createdAt: new Date().toISOString(),
    };

    localProducts = [newProduct, ...localProducts];
    saveStoredProducts(localProducts);
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
        saveStoredProducts(localProducts);
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
    saveStoredProducts(localProducts);
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
        const updated = response.data.data;
        localProducts = localProducts.map((p) => (p._id === id ? updated : p));
        saveStoredProducts(localProducts);
        return updated;
      }
    } catch {
      // Fallback locally
    }

    localProducts = localProducts.map((p) =>
      p._id === id ? { ...p, status: "unavailable", updatedAt: new Date().toISOString() } : p
    );
    saveStoredProducts(localProducts);
    const updated = localProducts.find((p) => p._id === id);
    if (!updated) throw new Error("Product not found");
    return updated;
  },
};
