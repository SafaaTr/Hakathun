"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductModal } from "@/components/products/ProductModal";
import { productService } from "@/services/product.service";
import { Product, CreateProductDto } from "@/types/product";
import { initialProducts } from "@/services/mockData";

export default function MyProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [filterStatus, setFilterStatus] = useState<"all" | "available" | "unavailable">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await productService.getProducts();
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleAddOrUpdate = async (dto: CreateProductDto) => {
    if (productToEdit) {
      const updated = await productService.updateProduct(productToEdit._id, dto);
      setProducts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );
    } else {
      const created = await productService.addProduct(dto);
      setProducts((prev) => [created, ...prev]);
    }
  };

  const handleDeactivate = async (id: string) => {
    // Soft deactivate - sets status to 'unavailable' (NFR-06)
    const deactivated = await productService.deactivateProduct(id);
    setProducts((prev) =>
      prev.map((p) => (p._id === id ? deactivated : p))
    );
  };

  const filteredProducts = products.filter((p) => {
    const matchesFilter =
      filterStatus === "all" ? true : p.status === filterStatus;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            My Products
          </h1>
          <p className="text-sm text-muted">
            Manage your pet store inventory, prices, and availability status.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setProductToEdit(null);
            setIsModalOpen(true);
          }}
          className="font-bold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-card-border p-3.5 rounded-2xl shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-input-border bg-input-bg text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-yellow/50"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <Filter className="w-4 h-4 text-muted mr-1 hidden sm:block" />
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-xs ${
              filterStatus === "all"
                ? "bg-navy text-white"
                : "text-muted hover:text-foreground hover:bg-cream/40"
            }`}
          >
            All ({products.length})
          </button>
          <button
            onClick={() => setFilterStatus("available")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-xs ${
              filterStatus === "available"
                ? "bg-emerald-600 text-white"
                : "text-muted hover:text-foreground hover:bg-cream/40"
            }`}
          >
            Available ({products.filter((p) => p.status === "available").length})
          </button>
          <button
            onClick={() => setFilterStatus("unavailable")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-xs ${
              filterStatus === "unavailable"
                ? "bg-slate-700 text-white"
                : "text-muted hover:text-foreground hover:bg-cream/40"
            }`}
          >
            Unavailable ({products.filter((p) => p.status === "unavailable").length})
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-80 rounded-2xl bg-card border border-card-border animate-pulse"
            />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-card border border-card-border rounded-2xl space-y-3">
          <p className="text-base font-semibold text-foreground">
            No products found matching your filter.
          </p>
          <p className="text-xs text-muted">
            Try adjusting your search query or add a new product above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onEdit={(p) => {
                setProductToEdit(p);
                setIsModalOpen(true);
              }}
              onDeactivate={handleDeactivate}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setProductToEdit(null);
        }}
        onSubmit={handleAddOrUpdate}
        productToEdit={productToEdit}
      />
    </div>
  );
}
