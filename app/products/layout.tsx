import type { ReactNode } from "react";

interface ProductsLayoutProps {
  children: ReactNode;
}

export default function ProductsLayout({
  children,
}: ProductsLayoutProps) {
  return (
    <div className="min-h-[60vh]">
      {children}
    </div>
  );
}
