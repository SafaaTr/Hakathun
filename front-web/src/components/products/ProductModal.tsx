"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Product, CreateProductDto } from "@/types/product";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductDto) => Promise<void>;
  productToEdit?: Product | null;
}

export function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  productToEdit,
}: ProductModalProps) {
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setDetails(productToEdit.details);
      setPrice(String(productToEdit.price));
      setImageUrl(productToEdit.imageUrl);
    } else {
      setName("");
      setDetails("");
      setPrice("");
      setImageUrl("https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&auto=format&fit=crop&q=80");
    }
    setError(null);
  }, [productToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Rule: "Please fill in all empty fields."
    if (!name.trim() || !details.trim() || !price || !imageUrl.trim()) {
      setError("Please fill in all empty fields.");
      return;
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setError("Please enter a valid price in SYP.");
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        details: details.trim(),
        price: numericPrice,
        imageUrl: imageUrl.trim(),
      });
      onClose();
    } catch {
      setError("Failed to save product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={productToEdit ? "Edit Product" : "Add New Product"}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {error && (
          <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-semibold">
            {error}
          </div>
        )}

        <Input
          label="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Royal Canin Mini Adult (3kg)"
        />

        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase">
            Product Details / Description
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
            placeholder="Detailed description of features, weight, or ingredients..."
            className="w-full rounded-xl border border-input-border bg-input-bg text-foreground placeholder:text-muted/60 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow/50 focus:border-yellow"
          />
        </div>

        <Input
          label="Price (New SYP)"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="e.g. 150000"
          min="1"
        />

        <Input
          label="Image URL"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://images.unsplash.com/..."
        />

        {imageUrl && (
          <div className="relative w-full h-32 rounded-xl overflow-hidden border border-card-border bg-cream/40">
            <Image
              src={imageUrl}
              alt="Preview"
              fill
              className="object-cover"
              onError={() => setError("Image URL preview failed to load.")}
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-card-border">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            className="font-bold"
          >
            {productToEdit ? "Save Changes" : "Add Product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
