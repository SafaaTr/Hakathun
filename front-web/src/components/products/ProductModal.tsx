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
  const [imgPreviewFailed, setImgPreviewFailed] = useState(false);

  const fallbackPetImage = "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&auto=format&fit=crop&q=80";

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
      setImageUrl(fallbackPetImage);
    }
    setError(null);
    setImgPreviewFailed(false);
  }, [productToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Rule: "Please fill in all empty fields."
    if (!name.trim() || !details.trim() || !price) {
      setError("Please fill in all empty fields.");
      return;
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setError("Please enter a valid price in SYP.");
      return;
    }

    const finalImageUrl = imageUrl.trim() || fallbackPetImage;

    setIsLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        details: details.trim(),
        price: numericPrice,
        imageUrl: finalImageUrl,
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

        <div>
          <Input
            label="Image URL"
            type="url"
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              setImgPreviewFailed(false);
            }}
            placeholder="https://images.unsplash.com/..."
          />
          {/* Quick preset suggestion buttons */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[11px] text-muted font-medium">Quick suggestions:</span>
            <button
              type="button"
              onClick={() => {
                setImageUrl("https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&auto=format&fit=crop&q=80");
                setImgPreviewFailed(false);
              }}
              className="text-[11px] px-2 py-0.5 rounded-lg bg-cream/70 dark:bg-card-border/50 text-foreground hover:bg-yellow hover:text-slate-900 transition-all active:scale-95 cursor-pointer font-medium"
            >
              Food Bag
            </button>
            <button
              type="button"
              onClick={() => {
                setImageUrl("https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400&auto=format&fit=crop&q=80");
                setImgPreviewFailed(false);
              }}
              className="text-[11px] px-2 py-0.5 rounded-lg bg-cream/70 dark:bg-card-border/50 text-foreground hover:bg-yellow hover:text-slate-900 transition-all active:scale-95 cursor-pointer font-medium"
            >
              Pet Bowl
            </button>
            <button
              type="button"
              onClick={() => {
                setImageUrl("https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&auto=format&fit=crop&q=80");
                setImgPreviewFailed(false);
              }}
              className="text-[11px] px-2 py-0.5 rounded-lg bg-cream/70 dark:bg-card-border/50 text-foreground hover:bg-yellow hover:text-slate-900 transition-all active:scale-95 cursor-pointer font-medium"
            >
              Harness & Leash
            </button>
            <button
              type="button"
              onClick={() => {
                setImageUrl("https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&auto=format&fit=crop&q=80");
                setImgPreviewFailed(false);
              }}
              className="text-[11px] px-2 py-0.5 rounded-lg bg-cream/70 dark:bg-card-border/50 text-foreground hover:bg-yellow hover:text-slate-900 transition-all active:scale-95 cursor-pointer font-medium"
            >
              Care & Grooming
            </button>
          </div>
        </div>

        {imageUrl && (
          <div className="relative w-full h-32 rounded-xl overflow-hidden border border-card-border bg-cream/40 flex items-center justify-center">
            {imgPreviewFailed ? (
              <div className="text-center p-3 text-xs text-muted">
                <span>Preview unavailable, but your image URL will still be saved successfully.</span>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => setImgPreviewFailed(true)}
              />
            )}
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
