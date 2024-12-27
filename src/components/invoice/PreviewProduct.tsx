"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductSelling } from "@/types/Product";
import { Package2, Calendar, RefreshCw } from "lucide-react";
import axios from 'axios';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface PreviewProductProps {
  ProductSellingId: number;
  isOpen: boolean;
  onClose: () => void;
  adjustmentDetails?: {
    removed: boolean;
  };
}

const PreviewProduct: React.FC<PreviewProductProps> = ({
  ProductSellingId,
  isOpen,
  onClose,
  adjustmentDetails,
}) => {
  const { toast } = useToast();
  const [product, setProduct] = useState<ProductSelling | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!ProductSellingId) return;
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/product-selling/${ProductSellingId}`);
        setProduct(response.data);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch product details.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && ProductSellingId) {
      fetchProduct();
    } else {
      setProduct(null);
    }
  }, [ProductSellingId, isOpen, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Product Details</DialogTitle>
            {adjustmentDetails?.removed && (
              <Badge variant="destructive" className="px-2 py-1">
                Removed
              </Badge>
            )}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-6 py-4">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        ) : product ? (
          <div className="space-y-6 py-4">
            <div className="rounded-lg border p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Package2 className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold">{product.productName}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Price:</span>
                  <span className="font-medium">₹{product.sellingPrice.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Unit:</span>
                  <span className="ml-2 font-medium">{product.unit}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Quantity:</span>
                  <span className="ml-2 font-medium">{product.quantity}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Created:</span>
                  <span>{new Date(product.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Updated:</span>
                  <span>{new Date(product.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-gray-500">No product details available</div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewProduct;