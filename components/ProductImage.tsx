"use client";

import { useState } from "react";
import { getProductImage } from "@/lib/product-images";

interface ProductImageProps {
  name: string;
  className?: string;
}

export default function ProductImage({
  name,
  className = "",
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const imageUrl = getProductImage(name);

  return (
    <div
      className={`relative overflow-hidden bg-orange-50 ${className}`}
    >
      {failed ? (
        <div
          role="img"
          aria-label={`Image unavailable for ${name}`}
          className="flex h-full min-h-40 items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 p-5 text-center text-sm font-semibold text-orange-700"
        >
          {name}
        </div>
      ) : (
        <img
          src={imageUrl}
          alt={`${name} product photo`}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      )}
    </div>
  );
}