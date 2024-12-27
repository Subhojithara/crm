"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { ProductPurchase, ProductSelling as ProductSellingType } from "@/types/Product";
import { Skeleton } from "@/components/ui/skeleton";
import ProductSellingTable from "./ProductSellingTable";

type ProductSellingProps = object;

const ProductSelling: React.FC<ProductSellingProps> = () => {
  const [productPurchases, setProductPurchases] = useState<ProductPurchase[]>([]);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string>("");
  const [sellingPrice, setSellingPrice] = useState<number | undefined>();
  const [unit, setUnit] = useState<string>("");
  const [quantity, setQuantity] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [productSellings, setProductSellings] = useState<ProductSellingType[]>([]);
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
    } catch (err: unknown) {
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

  const fetchProductSellings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/product-selling");
      if (!response.ok) {
        throw new Error("Failed to fetch product sellings");
      }
      const data = await response.json();
      setProductSellings(data);
    } catch (err: unknown) {
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

  useEffect(() => {
    fetchProductPurchases();
    fetchProductSellings();
  }, [fetchProductPurchases, fetchProductSellings]);

  useEffect(() => {
    if (selectedPurchaseId) {
      const selectedPurchase = productPurchases.find(
        (purchase) => purchase.id.toString() === selectedPurchaseId
      );
      if (selectedPurchase) {
        setQuantity(selectedPurchase.productQuantity);
      }
    }
  }, [selectedPurchaseId, productPurchases]);

  const handleSellingProduct = async () => {
    if (!selectedPurchaseId || sellingPrice === undefined || !unit || quantity === undefined) {
      setError("All fields are required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/product-selling", {
        method: "POST",
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
        throw new Error(errorData.error || "Failed to save product selling");
      }

      await response.json();
      toast({
        title: "Product Selling Saved",
        description: "Product selling information has been saved successfully.",
      });

      setSelectedPurchaseId("");
      setSellingPrice(undefined);
      setUnit("");
      setQuantity(undefined);
      fetchProductSellings();
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || "An unknown error occurred";
      console.error("Error saving product selling:", error);
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

  const handleDelete = (id: number) => {
    setProductSellings(productSellings.filter((selling) => selling.id !== id));
  };

  const handleUpdate = () => {
    fetchProductSellings();
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Sell Product</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sell Product</DialogTitle>
            <DialogDescription>
              Enter the details for selling the product.
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
              <div className="space-y-2">
                <Label htmlFor="productPurchase">Product Purchase</Label>
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
                        {`ID: ${purchase.id}, ${purchase.productName} (${purchase.productQuantity})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity || ""}
                  disabled={true}
                  className="bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Selling Price</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  placeholder="Enter selling price"
                  value={sellingPrice || ""}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  placeholder="Enter unit (e.g., kg, pcs)"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={handleSellingProduct}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Skeleton className="h-4 w-4 mr-2" /> Processing...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-6">
        <ProductSellingTable
          productSellings={productSellings}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      </div>
    </div>
  );
};

export default ProductSelling;
