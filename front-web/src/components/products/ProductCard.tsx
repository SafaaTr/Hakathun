"use client";

import { useState } from "react";
import { Product } from "@/types/product";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Edit2, EyeOff } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDeactivate: (id: string) => void;
}

export function ProductCard({ product, onEdit, onDeactivate }: ProductCardProps) {
  const isAvailable = product.status === "available";
  const defaultFallback = "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&auto=format&fit=crop&q=80";
  const [imgSrc, setImgSrc] = useState(product.imageUrl || defaultFallback);

  return (
    <div
      className={`group bg-card border border-card-border rounded-2xl overflow-hidden shadow-xs hover:-translate-y-2 hover:shadow-xl hover:border-yellow/50 transition-all duration-300 flex flex-col justify-between ${
        !isAvailable ? "opacity-75" : ""
      }`}
    >
      <div>
        {/* Product Image */}
        <div className="relative w-full h-48 bg-cream/40 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgSrc(defaultFallback)}
          />
          <div className="absolute top-3 right-3">
            <Badge status={product.status} />
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-2">
          <h3 className="font-bold text-base text-foreground line-clamp-1 group-hover:text-yellow transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-muted line-clamp-2 leading-relaxed">
            {product.details}
          </p>
        </div>
      </div>

      {/* Footer Price & Actions */}
      <div className="p-5 pt-0 border-t border-card-border/60 mt-2 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-muted block uppercase tracking-wider">
            Price
          </span>
          <span className="text-base font-extrabold text-navy dark:text-yellow">
            {(Number(product?.price) || 0).toLocaleString()} SYP
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(product)}
            className="p-2 transition-all duration-150 hover:scale-110 active:scale-90 hover:shadow-md hover:border-yellow/50"
            title="Edit product"
          >
            <Edit2 className="w-4 h-4 text-navy dark:text-yellow" />
          </Button>

          {isAvailable && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onDeactivate(product._id)}
              className="p-2 text-muted hover:text-danger hover:border-danger/40 transition-all duration-150 hover:scale-110 active:scale-90 hover:shadow-md"
              title="Deactivate product (make unavailable)"
            >
              <EyeOff className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
