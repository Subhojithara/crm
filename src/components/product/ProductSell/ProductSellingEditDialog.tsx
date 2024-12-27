"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ProductPurchase } from "@/types/Product";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit2 } from "lucide-react";

interface ProductSellingEditDialogProps {
  sellingId: number;
  onUpdate: (id: number) => void;
}

const ProductSellingEditDialog: React.FC<ProductSellingEditDialogProps> = ({
  sellingId,
  onUpdate,
}) => {
  const [productPurchases, setProductPurchases] = useState<ProductPurchase[]>(
    [],
  );
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string>("");
  const [sellingPrice, setSellingPrice] = useState<number | undefined>();
  const [unit, setUnit] = useState<string>("");
  const [quantity, setQuantity] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const fetchProductPurchases = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/product-purchase?status=not deducted");
      if (!response.ok) {
        throw new Error("Failed to fetch product purchases");
      }
      const data = await response.json();
      setProductPurchases(data);
    } catch (err) {
      const errorMessage = (err as Error).message || "An unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchProductSelling = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/product-selling/${sellingId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch product selling");
      }
      const data = await response.json();
      setSelectedPurchaseId(data.productPurchaseId.toString());
      setSellingPrice(data.sellingPrice);
      setUnit(data.unit);
      setQuantity(data.quantity);
    } catch (err) {
      const errorMessage = (err as Error).message || "An unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, sellingId]);

  useEffect(() => {
    if (isOpen) {
      fetchProductPurchases();
      if (sellingId) {
        fetchProductSelling();
      }
    }
  }, [isOpen, sellingId, fetchProductPurchases, fetchProductSelling]);

  const handleUpdateProductSelling = async () => {
    if (!selectedPurchaseId || !sellingPrice || !unit || !quantity) {
      setError("All fields are required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/product-selling/${sellingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productPurchaseId: selectedPurchaseId,
          sellingPrice,
          unit,
          quantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update product selling");
      }

      toast({
        title: "Product Selling Updated",
        description:
          "Product selling information has been updated successfully.",
      });

      onUpdate(sellingId);
      setIsOpen(false);
    } catch (err) {
      const errorMessage = (err as Error).message || "An unknown error occurred";
      console.error("Error updating product selling:", err);
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <Edit2 className="h-4 w-4" />
          <span className="sr-only">Edit product selling</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Product Selling</DialogTitle>
          <DialogDescription>
            Update the details for selling the product.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            {error && (
              <div
                className="bg-destructive/15 text-destructive text-sm p-3 rounded-md"
                role="alert"
              >
                {error}
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="productPurchase" className="text-right">
                Product
              </Label>
              <Select
                onValueChange={setSelectedPurchaseId}
                value={selectedPurchaseId}
              >
                <SelectTrigger id="productPurchase">
                  <SelectValue placeholder="Select Product Purchase" />
                </SelectTrigger>
                <SelectContent>
                  {productPurchases.map((purchase) => (
                    <SelectItem
                      key={purchase.id}
                      value={purchase.id.toString()}
                    >
                      {`${purchase.productName} (₹${purchase.purchaseAmount})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sellingPrice" className="text-right">
                Price
              </Label>
              <Input
                id="sellingPrice"
                type="number"
                placeholder="Enter selling price"
                value={sellingPrice || ""}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">
                Unit
              </Label>
              <Input
                id="unit"
                placeholder="Enter unit (e.g., kg, pcs)"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter quantity"
                value={quantity || ""}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button onClick={handleUpdateProductSelling} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductSellingEditDialog;
