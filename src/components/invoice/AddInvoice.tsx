"use client";

import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CreateInvoice from "./CreateInvoice"; // Import the CreateInvoice component
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog";
import PreviewProduct from "./PreviewProduct"; // Import PreviewProduct
import { Invoice } from "@/types/Invoice";
import axios from "axios";
import { Car } from "@/types/Car";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface Product {
  id: number;
  product: string;
  quantity: number;
  price: number;
  unit: string;
  tags: string[];
  picture: string | null;
}

interface Company {
  id: number;
  name: string;
  address: string;
  email: string; // Added email field
  phone: string;
  website: string;
  gst: string;
  upi: string;
  fssai: string;
  pan: string;
  bankDetails: string;
  bankName: string; // Added bankName field
  accountNumber: string; // Added accountNumber field
  ifsc: string; // Added ifsc field
}

interface Crate {
  id: number;
  crateName: string;
  crateQuantity: number;
}

interface InvoiceItem {
  unit: string;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  originalPrice?: number; // Optional field to track original price
  originalQuantity?: number; // Optional field to track original quantity
  crateId?: number; // Add crateId to associate with a crate
  crateName?: string; // Add crateName for display
  crateQuantity?: number; // Add crateQuantity for input
  originalCrateQuantity?: number; // Optional field to track original crate quantity
  totalPrice?: number;
}

export enum NotificationType {
  CREATED = "CREATED",
  EDITED = "EDITED",
  DELETED = "DELETED",
}

export interface Notification {
  id: number;
  userId: string;
  invoiceId: number;
  type: NotificationType;
  message: string;
  createdAt: string;
}

export interface ProductSelling {
  id: number;
  productPurchaseId: number;
  productName: string;
  sellingPrice: number;
  unit: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

const AddInvoice: React.FC = () => {
  const { toast } = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [crates, setCrates] = useState<Crate[]>([]);
  const [productSellings, setProductSellings] = useState<ProductSelling[]>([]);

  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { productId: 0, productName: "", price: 0, quantity: 1, unit: "" },
  ]);

  const [taxes, setTaxes] = useState({
    igst: 0,
    cgst: 0,
    sgst: 0,
  });

  const [totals, setTotals] = useState({
    totalPrice: 0,
    igstPrice: 0,
    cgstPrice: 0,
    sgstPrice: 0,
    totalTax: 0,
    netAmount: 0,
  });

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isPaymentStatusDialogOpen, setIsPaymentStatusDialogOpen] = useState(false);
  const [isPaymentMethodDialogOpen, setIsPaymentMethodDialogOpen] = useState(false);
  const [isAmountPaidDialogOpen, setIsAmountPaidDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false); // New state for details dialog

  const [paymentStatus, setPaymentStatus] = useState<"PAID" | "PENDING" | "UNPAID" | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [amountPaid, setAmountPaid] = useState<number>(0);

  const [showInvoice, setShowInvoice] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null); // State to hold the created invoice

  const [removedItems, setRemovedItems] = useState<InvoiceItem[]>([]);
  const [previewProductId, setPreviewProductId] = useState<number | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Set loading to true before fetching
      try {
        console.log("Fetching customers...");
        const customersResponse = await axios.get("/api/customers");
        console.log("Customers response:", customersResponse);
        setCustomers(customersResponse.data.customers);

        // Fetch companies
        const companiesResponse = await axios.get("/api/company");
        setCompanies(companiesResponse.data.companies);

        // Fetch cars
        const carsResponse = await axios.get("/api/car");
        setCars(carsResponse.data.cars);

        // Fetch product sellings
        const productSellingsResponse = await axios.get("/api/product-selling");
        console.log("Product Sellings Response:", productSellingsResponse);
        setProductSellings(productSellingsResponse.data);

        // Fetch crates
        const cratesResponse = await axios.get("/api/crates");
        setCrates(cratesResponse.data.crates);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch data.",
        });
      } finally {
        setIsLoading(false); // Set loading to false after fetching (success or error)
      }
    };

    fetchData();
  }, [toast]);

  // Calculate totals whenever invoice items or taxes change
  useEffect(() => {
    const calculateTotal = () => {
      let totalPrice = 0;
      invoiceItems.forEach((item) => {
        totalPrice += item.price * item.quantity;
      });

      const igstPrice = (totalPrice * taxes.igst) / 100;
      const cgstPrice = (totalPrice * taxes.cgst) / 100;
      const sgstPrice = (totalPrice * taxes.sgst) / 100;
      const totalTax = igstPrice + cgstPrice + sgstPrice;
      const netAmount = totalPrice + totalTax;

      setTotals({
        totalPrice,
        igstPrice,
        cgstPrice,
        sgstPrice,
        totalTax,
        netAmount,
      });
    };

    calculateTotal();
  }, [invoiceItems, taxes]);

  const handleItemChange = async (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const updatedItems = [...invoiceItems];
    const currentItem = updatedItems[index];

    // Initialize original fields if not already set
    if (
      (field === "price" || field === "quantity") &&
      (!currentItem.originalPrice || !currentItem.originalQuantity)
    ) {
      currentItem.originalPrice = currentItem.price;
      currentItem.originalQuantity = currentItem.quantity;
    }

    // Update the field with the new value
    updatedItems[index] = { ...currentItem, [field]: value };

    if (field === "productId") {
      const selectedProduct = productSellings.find(
        (product) => product.id === Number(value)
      );
      if (selectedProduct) {
        updatedItems[index].price = selectedProduct.sellingPrice;
        updatedItems[index].productName = selectedProduct.productName;
        updatedItems[index].unit = selectedProduct.unit;

        // Update original fields
        updatedItems[index].originalPrice = selectedProduct.sellingPrice;
        updatedItems[index].originalQuantity = selectedProduct.quantity;
      }
    } else if (field === "crateId") {
      const selectedCrate = crates.find((crate) => crate.id === Number(value));
      if (selectedCrate) {
        updatedItems[index].crateName = selectedCrate.crateName;
        updatedItems[index].crateQuantity = 0; // Initialize to 0, user will input
        updatedItems[index].originalCrateQuantity = selectedCrate.crateQuantity; // Track original quantity
      }
    } else if (field === "crateQuantity") {
      updatedItems[index].crateQuantity = Number(value);
    } else if (field === "quantity" || field === "price") {
      // Update quantity or price, then recalculate totalPrice
      updatedItems[index] = { ...currentItem, [field]: value };

      // Recalculate totalPrice if both quantity and price are available
      if (updatedItems[index].quantity && updatedItems[index].price) {
        updatedItems[index].totalPrice =
          updatedItems[index].quantity * updatedItems[index].price;
      }
    }

    setInvoiceItems(updatedItems);
    calculateTotals(updatedItems);
  };

  const addItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      {
        productId: 0,
        productName: "",
        price: 0,
        quantity: 1,
        unit: "",
        crateId: undefined, // Initialize crateId
        crateName: "", // Initialize crateName
        crateQuantity: 0, // Initialize crateQuantity
      },
    ]);
  };

  const removeItem = (index: number) => {
    const updatedItems = [...invoiceItems];
    const [removedItem] = updatedItems.splice(index, 1);
    setInvoiceItems(updatedItems);
    setRemovedItems([...removedItems, removedItem]); // Track removed items

    // Update deduct status and deductingAt
    updateProductDeductStatus(removedItem.productId);
    calculateTotals(updatedItems);
  };

  const updateProductDeductStatus = async (productId: number) => {
    try {
      const response = await fetch(`/api/products`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: productId,
          deductStatus: "DEDUCTED",
          deductingAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to update product deduct status');

      const updatedProduct: Product = await response.json();
      toast({
        title: 'Success',
        description: `Product "${updatedProduct.product}" marked as deducted.`,
        variant: 'default',
      });
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update product deduct status.',
        variant: 'destructive',
      });
    }
  };

  const calculateTotals = (items: InvoiceItem[]) => {
    // Calculate totalPrice based on the sum of item.totalPrice
    const totalPrice = items.reduce((acc, item) => acc + (item.totalPrice || 0), 0);

    const igstPrice = (taxes.igst / 100) * totalPrice;
    const cgstPrice = (taxes.cgst / 100) * totalPrice;
    const sgstPrice = (taxes.sgst / 100) * totalPrice;
    const totalTax = igstPrice + cgstPrice + sgstPrice;
    const netAmount = totalPrice + totalTax;
    setTotals({ totalPrice, igstPrice, cgstPrice, sgstPrice, totalTax, netAmount });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomerId || !selectedCompanyId || !selectedCarId) {
      toast({
        title: "Error",
        description: "Please select a customer, company, and car.",
        variant: "destructive",
      });
      return;
    }

    // Open confirmation dialog
    setIsConfirmDialogOpen(true);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      if (!selectedCustomerId || !selectedCompanyId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a customer and a company.",
        });
        return;
      }

      const invoiceData = {
        companyId: selectedCompanyId,
        clientId: selectedCustomerId,
        items: invoiceItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
          crateId: item.crateId,
          crateName: item.crateName,
          crateQuantity: item.crateQuantity,
        })),
        igst: taxes.igst,
        cgst: taxes.cgst,
        sgst: taxes.sgst,
        totalAmount: totals.totalPrice,
        netAmount: totals.netAmount,
        paymentStatus: paymentStatus || "UNPAID",
        paymentMethod: paymentMethod,
        amountPaid: amountPaid,
        carId: selectedCarId,
      };

      console.log("Invoice Data being sent:", invoiceData);

      const response = await axios.post("/api/invoiceTable", invoiceData);
      console.log("Response from invoice creation:", response.data);
      setCreatedInvoice(response.data);
      setShowInvoice(true);
      setIsConfirmDialogOpen(false);
      toast({
        title: "Success",
        description: "Invoice created successfully!",
      });
    } catch (error: unknown) {
      console.error("Error creating invoice:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create invoice.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentStatusConfirm = () => {
    if (paymentStatus !== "UNPAID") {
      toast({
        title: "Error",
        description: "Only 'Unpaid' status is allowed.",
        variant: "destructive",
      });
      return;
    }
    setIsPaymentStatusDialogOpen(false);
    handleFinalConfirm();
  };

  const handlePaymentMethodConfirm = () => {
    if (paymentMethod.trim() === "") {
      toast({
        title: "Error",
        description: "Please enter a payment method.",
        variant: "destructive",
      });
      return;
    }
    setIsPaymentMethodDialogOpen(false);
    handleFinalConfirm();
  };

  const handleAmountPaidConfirm = () => {
    if (amountPaid <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount paid.",
        variant: "destructive",
      });
      return;
    }
    if (amountPaid > totals.netAmount) {
      toast({
        title: "Error",
        description: "Amount paid cannot exceed the net amount.",
        variant: "destructive",
      });
      return;
    }
    setIsAmountPaidDialogOpen(false);
    handleFinalConfirm();
  };

  const handleFinalConfirm = async () => {
    const invoiceData = {
      clientId: selectedCustomerId,
      companyId: selectedCompanyId,
      items: invoiceItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit,
        crateId: item.crateId,
        crateQuantity: item.crateQuantity,
      })),
      igst: taxes.igst,
      cgst: taxes.cgst,
      sgst: taxes.sgst,
      totalAmount: totals.totalPrice,
      netAmount: totals.netAmount,
      paymentStatus: "UNPAID",
      paymentMethod: null,
      amountPaid: 0,
      carId: selectedCarId,
    };

    console.log("Constructed invoiceData:", invoiceData); // Debugging

    try {
      const response = await fetch("/api/invoiceTable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to create invoice",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const result = await response.json();
      console.log("Invoice created successfully:", result);

      // Show the invoice after successful creation
      setShowInvoice(true);
      setCreatedInvoice(result);
    } catch (error: unknown) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handler to open details dialog
  const handleViewDetails = () => {
    if (selectedCustomerId && selectedCompanyId) {
      setIsDetailsDialogOpen(true);
    } else {
      toast({
        title: "Error",
        description: "Please select both customer and company to view details.",
        variant: "destructive",
      });
    }
  };

  // Handler to open preview dialog
  const handleViewPreview = (productId: number) => {
    setPreviewProductId(productId);
    setIsPreviewOpen(true);
  };

  // Get selected customer, company, and car details
  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId);
  const selectedCompany = companies.find((company) => company.id === selectedCompanyId);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Create Invoice</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[85%] h-[95vh] max-h-[95vh] overflow-y-auto">
        <ScrollArea className="h-full">
          <DialogTitle className="text-2xl font-bold tracking-tight">Create Invoice</DialogTitle>
          <Tabs defaultValue="invoice" className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 rounded-lg bg-muted p-1">
              <TabsTrigger value="invoice" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-primary">Invoice</TabsTrigger>
              <TabsTrigger value="crate" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-primary">Invoice Bill</TabsTrigger>
            </TabsList>
            <TabsContent value="invoice" className="flex-grow overflow-y-auto">
              <div className="h-full w-full">
                <Card className="h-full flex flex-col">
                  <CardHeader className="">
                    <CardTitle className="text-xl font-semibold">Create New Invoice</CardTitle>
                    <CardDescription>Fill in the invoice details below.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow overflow-y-auto p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Customer Selection */}
                        <div className="space-y-2">
                          <Label htmlFor="customer" className="text-sm font-medium">
                            Select Customer
                          </Label>
                          <Select
                            onValueChange={(value) => setSelectedCustomerId(Number(value))}
                            value={selectedCustomerId ? selectedCustomerId.toString() : ""}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a customer" />
                            </SelectTrigger>
                            <SelectContent>
                              <ScrollArea className="h-48">
                                <SelectGroup>
                                  {customers.map((customer) => (
                                    <SelectItem key={customer.id} value={customer.id.toString()}>
                                      {customer.name}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </ScrollArea>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Company Selection */}
                        <div className="space-y-2">
                          <Label htmlFor="company" className="text-sm font-medium">
                            Select Company
                          </Label>
                          <Select
                            onValueChange={(value) => setSelectedCompanyId(Number(value))}
                            value={selectedCompanyId ? selectedCompanyId.toString() : ""}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a company" />
                            </SelectTrigger>
                            <SelectContent>
                              <ScrollArea className="h-48">
                                <SelectGroup>
                                  {companies.map((company) => (
                                    <SelectItem key={company.id} value={company.id.toString()}>
                                      {company.name}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </ScrollArea>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Car Selection */}
                        <div className="space-y-2">
                          <Label htmlFor="car" className="text-sm font-medium">
                            Select Car
                          </Label>
                          <Select
                            onValueChange={(value) => setSelectedCarId(Number(value))}
                            value={selectedCarId ? selectedCarId.toString() : ""}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a car" />
                            </SelectTrigger>
                            <SelectContent>
                              <ScrollArea className="h-48">
                                <SelectGroup>
                                  {cars.map((car) => (
                                    <SelectItem key={car.id} value={car.id?.toString() || ""}>
                                      {car.carNumber} - {car.driverName}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </ScrollArea>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* View Details Button */}
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          onClick={handleViewDetails}
                          disabled={!selectedCustomerId || !selectedCompanyId}
                          className=""
                        >
                          View Customer & Company Details
                        </Button>
                      </div>

                      {/* Invoice Items */}
                      <div className="space-y-4">
                        <Label className="text-lg font-semibold">Items</Label>
                        <div className="space-y-4">
                          {invoiceItems.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-4 p-6 rounded-lg bg-muted/50 border"
                            >
                              {/* Product Selection */}
                              <Select
                                onValueChange={(value) =>
                                  handleItemChange(index, "productId", Number(value))
                                }
                                value={item.productId ? item.productId.toString() : ""}
                              >
                                <SelectTrigger className="flex-1">
                                  <SelectValue placeholder="Select a product" />
                                </SelectTrigger>
                                <SelectContent>
                                  <ScrollArea className="h-48">
                                    <SelectGroup>
                                      {productSellings.map((product) => (
                                        <SelectItem
                                          key={product.id}
                                          value={product.id.toString()}
                                        >
                                          {product.productName}
                                        </SelectItem>
                                      ))}
                                    </SelectGroup>
                                  </ScrollArea>
                                </SelectContent>
                              </Select>

                              {/* Crate Selection */}
                              <Select
                                onValueChange={(value) =>
                                  handleItemChange(index, "crateId", Number(value))
                                }
                                value={item.crateId ? item.crateId.toString() : ""}
                              >
                                <SelectTrigger className="flex-1">
                                  <SelectValue placeholder="Select a crate" />
                                </SelectTrigger>
                                <SelectContent>
                                  <ScrollArea className="h-48">
                                    <SelectGroup>
                                      {crates.map((crate) => (
                                        <SelectItem key={crate.id} value={crate.id.toString()}>
                                          {crate.crateName} (Qty: {crate.crateQuantity})
                                        </SelectItem>
                                      ))}
                                    </SelectGroup>
                                  </ScrollArea>
                                </SelectContent>
                              </Select>

                              {/* Crate Quantity Input */}
                              {item.crateId && (
                                <div className="w-32">
                                  <Label htmlFor={`crateQuantity-${index}`} className="text-sm">
                                    Crate Qty
                                  </Label>
                                  <Input
                                    id={`crateQuantity-${index}`}
                                    type="number"
                                    min={0}
                                    max={
                                      crates.find((crate) => crate.id === item.crateId)?.crateQuantity || 0
                                    }
                                    value={item.crateQuantity || 0}
                                    onChange={(e) =>
                                      handleItemChange(index, "crateQuantity", Number(e.target.value))
                                    }
                                    placeholder="0"
                                    required
                                    className="mt-1"
                                  />
                                </div>
                              )}

                              {/* Quantity Input */}
                              <div className="w-32">
                                <Label htmlFor={`quantity-${index}`} className="text-sm">
                                  Quantity
                                </Label>
                                <Input
                                  id={`quantity-${index}`}
                                  type="number"
                                  min={1}
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleItemChange(index, "quantity", Number(e.target.value))
                                  }
                                  placeholder="1"
                                  required
                                  className="mt-1"
                                />
                              </div>

                              {/* Price Display */}
                              <div className="w-32">
                                <Label className="text-sm">Price</Label>
                                <p className="text-2xl font-bold text-primary">₹{item.price.toFixed(2)}</p>
                              </div>

                              {/* Preview Product Button */}
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => handleViewPreview(item.productId)}
                                className="self-center"
                              >
                                Preview
                              </Button>

                              {/* Remove Item Button */}
                              {invoiceItems.length > 1 && (
                                <Button
                                  type="button"
                                  variant="destructive"
                                  onClick={() => removeItem(index)}
                                  className="self-end"
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Add Item Button */}
                        <Button
                          type="button"
                          onClick={addItem}
                          className="w-full"
                        >
                          Add Item
                        </Button>
                      </div>

                      {/* Tax Inputs */}
                      <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="igst" className="text-sm font-medium">
                            IGST (%)
                          </Label>
                          <Input
                            id="igst"
                            type="number"
                            min={0}
                            value={taxes.igst}
                            onChange={(e) =>
                              setTaxes({ ...taxes, igst: Number(e.target.value) })
                            }
                            placeholder="IGST (%)"
                            required
                            className="text-left"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cgst" className="text-sm font-medium">
                            CGST (%)
                          </Label>
                          <Input
                            id="cgst"
                            type="number"
                            min={0}
                            value={taxes.cgst}
                            onChange={(e) =>
                              setTaxes({ ...taxes, cgst: Number(e.target.value) })
                            }
                            placeholder="CGST (%)"
                            required
                            className="text-left"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sgst" className="text-sm font-medium">
                            SGST (%)
                          </Label>
                          <Input
                            id="sgst"
                            type="number"
                            min={0}
                            value={taxes.sgst}
                            onChange={(e) =>
                              setTaxes({ ...taxes, sgst: Number(e.target.value) })
                            }
                            placeholder="SGST (%)"
                            required
                            className="text-left"
                          />
                        </div>
                      </div>

                      {/* Totals */}
                      {isLoading ? (
                        <div>Loading...</div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                          <div className="p-6 rounded-lg bg-primary/5 border space-y-2">
                            <Label className="text-sm text-muted-foreground">Total Price:</Label>
                            <p className="text-2xl font-bold text-primary">
                              ₹{totals.totalPrice.toFixed(2)}
                            </p>
                          </div>
                          <div className="p-6 rounded-lg bg-primary/5 border space-y-2">
                            <Label className="text-sm text-muted-foreground">Total Tax:</Label>
                            <p className="text-2xl font-bold text-primary">
                              ₹{totals.totalTax.toFixed(2)}
                            </p>
                          </div>
                          <div className="p-6 rounded-lg bg-primary/10 border space-y-2">
                            <Label className="text-sm text-muted-foreground">Net Amount:</Label>
                            <p className="text-2xl font-bold text-primary">
                              ₹{totals.netAmount.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      )}

                      <Button type="submit" className="w-full mt-8">
                        Create Invoice
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Rest of the dialogs and components remain unchanged */}
                <AlertDialog
                  open={isConfirmDialogOpen}
                  onOpenChange={setIsConfirmDialogOpen}
                >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Invoice Creation</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to create this invoice? The product
                        quantities will be deducted from the inventory.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        onClick={() => setIsConfirmDialogOpen(false)}
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={handleConfirm}>
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog
                  open={isPaymentStatusDialogOpen}
                  onOpenChange={setIsPaymentStatusDialogOpen}
                >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Select Payment Status</AlertDialogTitle>
                      <AlertDialogDescription>
                        Please select the payment status for this invoice.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="px-6 py-4 space-y-2">
                      <Label>Payment Status</Label>
                      <Select
                        onValueChange={(value) => setPaymentStatus(value as "UNPAID")}
                        value={paymentStatus ? paymentStatus : ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Payment Status</SelectLabel>
                            <SelectItem value="UNPAID">Unpaid</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setIsPaymentStatusDialogOpen(false)}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={handlePaymentStatusConfirm}>
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog
                  open={isPaymentMethodDialogOpen}
                  onOpenChange={setIsPaymentMethodDialogOpen}
                >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Enter Payment Method</AlertDialogTitle>
                      <AlertDialogDescription>
                        Please enter the payment method for this invoice.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="px-6 py-4 space-y-2">
                      <Label htmlFor="paymentMethod">
                        Payment Method
                      </Label>
                      <Input
                        id="paymentMethod"
                        type="text"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        placeholder="e.g., Credit Card, Bank Transfer"
                        required
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setIsPaymentMethodDialogOpen(false)}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={handlePaymentMethodConfirm}>
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog
                  open={isAmountPaidDialogOpen}
                  onOpenChange={setIsAmountPaidDialogOpen}
                >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Enter Amount Paid</AlertDialogTitle>
                      <AlertDialogDescription>
                        Please enter the amount paid for this invoice.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="px-6 py-4 space-y-2">
                      <Label htmlFor="amountPaid">
                        Amount Paid
                      </Label>
                      <Input
                        id="amountPaid"
                        type="number"
                        min={0}
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(Number(e.target.value))}
                        placeholder="Enter amount paid"
                        required
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setIsAmountPaidDialogOpen(false)}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={handleAmountPaidConfirm}>
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog
                  open={isDetailsDialogOpen}
                  onOpenChange={setIsDetailsDialogOpen}
                >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Customer & Company Details</AlertDialogTitle>
                      <AlertDialogDescription>
                        Below are the details of the selected customer and company.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="px-6 py-4 space-y-6">
                      {selectedCustomer && (
                        <div>
                          <h3 className="text-lg font-semibold">Customer Details</h3>
                          <p>
                            <strong>Name:</strong> {selectedCustomer.name}
                          </p>
                          <p>
                            <strong>Email:</strong> {selectedCustomer.email}
                          </p>
                          <p>
                            <strong>Phone:</strong> {selectedCustomer.phone}
                          </p>
                          <p>
                            <strong>Address:</strong> {selectedCustomer.address}
                          </p>
                        </div>
                      )}

                      {selectedCompany && (
                        <div>
                          <h3 className="text-lg font-semibold">Company Details</h3>
                          <p>
                            <strong>Name:</strong> {selectedCompany.name}
                          </p>
                          <p>
                            <strong>Address:</strong> {selectedCompany.address}
                          </p>
                          <p>
                            <strong>Phone:</strong> {selectedCompany.phone}
                          </p>
                          <p>
                            <strong>Website:</strong> {selectedCompany.website}
                          </p>
                          <p>
                            <strong>GST:</strong> {selectedCompany.gst}
                          </p>
                          <p>
                            <strong>UPI:</strong> {selectedCompany.upi}
                          </p>
                          <p>
                            <strong>Email:</strong> {selectedCompany.email}
                          </p>
                          <p>
                            <strong>Bank Name:</strong> {selectedCompany.bankName}
                          </p>
                          <p>
                            <strong>Account Number:</strong>{" "}
                            {selectedCompany.accountNumber}
                          </p>
                          <p>
                            <strong>IFSC:</strong> {selectedCompany.ifsc}
                          </p>
                          
                        </div>
                      )}
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setIsDetailsDialogOpen(false)}>
                        Close
                      </AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {previewProductId && (
                  <PreviewProduct
                    ProductSellingId={previewProductId}
                    isOpen={isPreviewOpen}
                    onClose={() => {
                      setIsPreviewOpen(false);
                      setPreviewProductId(null); // Reset previewProductId on close
                    }}
                    adjustmentDetails={
                      removedItems.find(
                        (item) => item.productId === previewProductId
                      )
                        ? { removed: true }
                        : undefined
                    }
                  />
                )}

                {
                  showInvoice && createdInvoice && (
                    <CreateInvoice
                      customer={
                        selectedCustomerId
                          ? customers.find((customer) => customer.id === selectedCustomerId) ?? undefined
                          : undefined
                      }
                      company={selectedCompany}
                      items={invoiceItems}
                      taxes={taxes}
                      totals={totals}
                      car={
                        selectedCarId
                          ? cars.find((car) => car.id === selectedCarId) ?? undefined
                          : undefined
                      }
                      amountPaid={amountPaid}
                      createdInvoice={createdInvoice}
                    />
                  )
                }
              </div>
            </TabsContent>
            <TabsContent value="crate" className="flex-grow overflow-y-auto">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Invoice Bill Preview Section</CardTitle>
                  <CardDescription></CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Add your Invoice Bill Preview content here */}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AddInvoice;
