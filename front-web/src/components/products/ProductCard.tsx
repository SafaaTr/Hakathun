import Image from "next/image";
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

  return (
    <div
      className={`bg-card border border-card-border rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
        !isAvailable ? "opacity-75" : ""
      }`}
    >
      <div>
        {/* Product Image */}
        <div className="relative w-full h-48 bg-cream/40 overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3">
            <Badge status={product.status} />
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-2">
          <h3 className="font-bold text-base text-foreground line-clamp-1">
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
            {product.price.toLocaleString()} SYP
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(product)}
            className="p-2"
            title="Edit product"
          >
            <Edit2 className="w-4 h-4 text-navy dark:text-yellow" />
          </Button>

          {isAvailable && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onDeactivate(product._id)}
              className="p-2 text-muted hover:text-danger hover:border-danger/40"
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
