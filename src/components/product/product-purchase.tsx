'use client'

import React, { useEffect, useState } from 'react'
import { Company } from '@/types/Company'
import { Seller } from '@/types/Seller'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import PurchaseInvoice from './PurchaseInvoice'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ProductPurchase } from '@/types/Product'
import { X } from 'lucide-react'

interface ProductEntry {
  productName: string;
  productQuantity: number;
  purchaseAmount: number;
  received?: number;
  leaf?: number;
  rej?: number;
  shortage?: number;
}

const PurchaseProduct = () => {
    const [companies, setCompanies] = useState<Company[] | null>(null)
    const [sellers, setSellers] = useState<Seller[]>([])
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')
    const [selectedSellerId, setSelectedSellerId] = useState<string>('')
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [searchTerm, setSearchTerm] = useState<string>('')
    const { toast } = useToast()
    const [invoiceData, setInvoiceData] = useState<{
        company: Company | null;
        seller: Seller | null;
        purchases: ProductPurchase[];
    } | null>(null);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [kantaWeight, setKantaWeight] = useState<number | undefined>(undefined);
    const [truckNumber, setTruckNumber] = useState<string | undefined>(undefined);
    const [chNo, setChNo] = useState<string | undefined>(undefined);
    const [fare, setFare] = useState<number | undefined>(undefined);
    const [remarks, setRemarks] = useState<string | undefined>(undefined);
    const [productEntries, setProductEntries] = useState<ProductEntry[]>([{
        productName: '',
        productQuantity: 0,
        purchaseAmount: 0,
        received: undefined,
        leaf: undefined,
        rej: undefined,
        shortage: undefined,
    }]);

    const handleAddProductEntry = () => {
        setProductEntries([
            ...productEntries,
            {
                productName: '',
                productQuantity: 0,
                purchaseAmount: 0,
                received: undefined,
                leaf: undefined,
                rej: undefined,
                shortage: undefined,
            },
        ]);
    };

    const handleRemoveProductEntry = (index: number) => {
        setProductEntries(productEntries.filter((_, i) => i !== index));
    };

    const handleProductEntryChange = (index: number, field: keyof ProductEntry, value: string | number | undefined) => {
        setProductEntries(
            productEntries.map((entry, i) =>
                i === index ? { ...entry, [field]: value } : entry
            )
        );
    };

    const handlePurchase = async () => {
        console.log('handlePurchase called');
        if (!selectedCompanyId || !selectedSellerId) {
            console.log('Company and Seller are required');
            setError('Company and Seller are required');
            return;
        }

        const hasEmptyFields = productEntries.some(
            (entry) => !entry.productName || !entry.productQuantity || !entry.purchaseAmount
        );

        if (hasEmptyFields) {
            console.log('All product fields are required');
            setError('All product fields are required');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log('Sending request to /api/product-purchase');
            const response = await fetch('/api/product-purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    companyId: selectedCompanyId,
                    sellerId: selectedSellerId,
                    products: productEntries,
                    kantaWeight,
                    truckNumber,
                    chNo,
                    fare,
                    remarks,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to save purchase', errorData);
                throw new Error(errorData.error || 'Failed to save purchase');
            }

            const responseData = await response.json();
            console.log('Purchase successful', responseData);

            // Send request to create PurchaseInvoice
            const invoiceResponse = await fetch('/api/purchase-invoice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    companyId: selectedCompanyId,
                    sellerId: selectedSellerId,
                    productPurchases: responseData.productPurchases, // Pass the created ProductPurchase records
                    // ... any other data you want to store in PurchaseInvoice
                }),
            });

            if (!invoiceResponse.ok) {
                const errorData = await invoiceResponse.json();
                console.error('Failed to save purchase invoice', errorData);
                throw new Error(errorData.error || 'Failed to save purchase invoice');
            }

            const invoiceData = await invoiceResponse.json();
            console.log('Purchase invoice saved successfully', invoiceData);

            toast({
                title: "Purchase Successful",
                description: "Your purchase has been saved successfully.",
            })
            // Reset form
            setSelectedCompanyId('')
            setSelectedSellerId('')
            setInvoiceData({
                company:
                    companies?.find(
                        (company) => company.id === parseInt(selectedCompanyId)
                    ) || null,
                seller:
                    sellers.find((seller) => seller.id === parseInt(selectedSellerId)) ||
                    null,
                purchases: responseData.productPurchases.map((purchase: ProductPurchase) => ({
                    ...purchase,
                    received: purchase.received || undefined,
                    leaf: purchase.leaf || undefined,
                    rej: purchase.rej || undefined,
                    shortage: purchase.shortage || undefined,
                    kantaWeight: purchase.kantaWeight || undefined,
                    truckNumber: purchase.truckNumber || undefined,
                    chNo: purchase.chNo || undefined,
                    fare: purchase.fare || undefined,
                })),
            });
        } catch (error) {
            if (error instanceof Error) {
                console.error('Detailed Error:', {
                    message: error.message,
                    stack: error.stack,
                });

                console.error('Error saving purchase:', error)
                setError(error.message)
                toast({
                    title: "Purchase Failed",
                    description: error.message,
                    variant: "destructive",
                })
            } else {
                console.error('An unexpected error occurred:', error);
                setError('An unexpected error occurred.');
                toast({
                    title: "Purchase Failed",
                    description: 'An unexpected error occurred.',
                    variant: "destructive",
                });
            }
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        const fetchCompaniesAndSellers = async () => {
            console.log('Fetching companies and sellers');
            setIsDataLoading(true);
            try {
                const [companyResponse, sellerResponse] = await Promise.all([
                    fetch('/api/company'),
                    fetch('/api/seller')
                ])

                if (!companyResponse.ok) {
                    const errorData = await companyResponse.json();
                    console.error('Failed to fetch companies', errorData);
                    throw new Error(errorData.error || 'Failed to fetch companies')
                }
                if (!sellerResponse.ok) {
                    const errorData = await sellerResponse.json();
                    console.error('Failed to fetch sellers', errorData);
                    throw new Error(errorData.error || 'Failed to fetch sellers')
                }

                const companiesData = await companyResponse.json()
                const sellersData = await sellerResponse.json()

                if (Array.isArray(companiesData.companies)) {
                    console.log('Companies fetched successfully', companiesData.companies);
                    setCompanies(companiesData.companies)
                } else {
                    console.error('Companies data is not in the expected format', companiesData);
                    setError('Companies data is not in the expected format')
                }

                if (Array.isArray(sellersData)) {
                    console.log('Sellers fetched successfully', sellersData);
                    setSellers(sellersData)
                } else {
                    console.error('Sellers data is not an array', sellersData);
                    setError('Sellers data is not an array')
                }
            } catch (err) {
                if (err instanceof Error) {
                    console.error('Error fetching data', err.message);
                    setError(err.message)
                    toast({
                        title: "Error",
                        description: err.message,
                        variant: "destructive",
                    })
                } else {
                    console.error('An unexpected error occurred:', err);
                    setError('An unexpected error occurred.');
                    toast({
                        title: "Error",
                        description: 'An unexpected error occurred.',
                        variant: "destructive",
                    });
                }
            } finally {
                setIsDataLoading(false);
            }
        }

        fetchCompaniesAndSellers()
    }, [toast])

    const filteredCompanies = companies?.filter(company => company.name.toLowerCase().includes(searchTerm.toLowerCase()))
    const filteredSellers = sellers.filter(seller => seller.name.toLowerCase().includes(searchTerm.toLowerCase()))

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Purchase Product</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Purchase Product</DialogTitle>
                    <DialogDescription>
                        Enter the details of your product purchase.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[500px] w-full rounded-md border">
                    {isDataLoading ? (
                        <div className="space-y-4 p-4">
                            {[...Array(4)].map((_, index) => (
                                <Skeleton key={index} className="h-14 w-full" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid gap-4 py-4 p-4">
                            {error && (
                                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md" role="alert">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="company">Company</Label>
                                <Select onValueChange={(value) => setSelectedCompanyId(value)} value={selectedCompanyId}>
                                    <SelectTrigger id="company">
                                        <SelectValue placeholder="Select Company" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <Input
                                            id="company-search"
                                            placeholder="Search..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        {filteredCompanies && filteredCompanies.map((company) => (
                                            company.id ? (
                                                <SelectItem key={company.id} value={company.id.toString()}>
                                                    {company.name}
                                                </SelectItem>
                                            ) : null
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="seller">Seller</Label>
                                <Select onValueChange={(value) => setSelectedSellerId(value)} value={selectedSellerId}>
                                    <SelectTrigger id="seller">
                                        <SelectValue placeholder="Select Seller" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <Input
                                            id="seller-search"
                                            placeholder="Search..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        {filteredSellers.map((seller) => (
                                            <SelectItem key={seller.id} value={seller.id.toString()}>
                                                {seller.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {productEntries.map((entry, index) => (
                                <div key={index} className="border p-4 rounded-md">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold">
                                            Product {index + 1}
                                        </h3>
                                        {productEntries.length > 1 && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveProductEntry(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`productName-${index}`}>
                                            Product Name
                                        </Label>
                                        <Input
                                            id={`productName-${index}`}
                                            placeholder="Enter product name"
                                            value={entry.productName}
                                            onChange={(e) =>
                                                handleProductEntryChange(
                                                    index,
                                                    'productName',
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`productQuantity-${index}`}>
                                            Product Quantity
                                        </Label>
                                        <Input
                                            id={`productQuantity-${index}`}
                                            type="number"
                                            placeholder="Enter quantity"
                                            value={entry.productQuantity || ''}
                                            onChange={(e) =>
                                                handleProductEntryChange(
                                                    index,
                                                    'productQuantity',
                                                    Number(e.target.value)
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`purchaseAmount-${index}`}>
                                            Purchase Amount
                                        </Label>
                                        <Input
                                            id={`purchaseAmount-${index}`}
                                            type="number"
                                            placeholder="Enter purchase amount"
                                            value={entry.purchaseAmount || ''}
                                            onChange={(e) =>
                                                handleProductEntryChange(
                                                    index,
                                                    'purchaseAmount',
                                                    Number(e.target.value)
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`received-${index}`}>Received</Label>
                                        <Input
                                            id={`received-${index}`}
                                            type="number"
                                            placeholder="Enter received quantity"
                                            value={entry.received || ''}
                                            onChange={(e) =>
                                                handleProductEntryChange(
                                                    index,
                                                    'received',
                                                    Number(e.target.value)
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`leaf-${index}`}>Leaf</Label>
                                        <Input
                                            id={`leaf-${index}`}
                                            type="number"
                                            placeholder="Enter leaf quantity"
                                            value={entry.leaf || ''}
                                            onChange={(e) =>
                                                handleProductEntryChange(
                                                    index,
                                                    'leaf',
                                                    Number(e.target.value)
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`rej-${index}`}>Rej</Label>
                                        <Input
                                            id={`rej-${index}`}
                                            type="number"
                                            placeholder="Enter rejected quantity"
                                            value={entry.rej || ''}
                                            onChange={(e) =>
                                                handleProductEntryChange(
                                                    index,
                                                    'rej',
                                                    Number(e.target.value)
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`shortage-${index}`}>Shortage</Label>
                                        <Input
                                            id={`shortage-${index}`}
                                            type="number"
                                            placeholder="Enter shortage quantity"
                                            value={entry.shortage || ''}
                                            onChange={(e) =>
                                                handleProductEntryChange(
                                                    index,
                                                    'shortage',
                                                    Number(e.target.value)
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" onClick={handleAddProductEntry}>
                                Add Product
                            </Button>
                            <div className="space-y-2">
                                <Label htmlFor="kantaWeight">Kanta Weight</Label>
                                <Input
                                    id="kantaWeight"
                                    type="number"
                                    placeholder="Enter Kanta Weight"
                                    value={kantaWeight || ''}
                                    onChange={(e) => setKantaWeight(Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="truckNumber">Truck Number</Label>
                                <Input
                                    id="truckNumber"
                                    placeholder="Enter Truck Number"
                                    value={truckNumber || ''}
                                    onChange={(e) => setTruckNumber(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="chNo">CH NO</Label>
                                <Input
                                    id="chNo"
                                    placeholder="Enter CH NO"
                                    value={chNo || ''}
                                    onChange={(e) => setChNo(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fare">Fare</Label>
                                <Input
                                    id="fare"
                                    type="number"
                                    placeholder="Enter Fare"
                                    value={fare || ''}
                                    onChange={(e) => setFare(Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="remarks">Remarks</Label>
                                <Input
                                    id="remarks"
                                    placeholder="Enter Remarks"
                                    value={remarks || ''}
                                    onChange={(e) => setRemarks(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </ScrollArea>
                <DialogFooter>
                    <Button onClick={handlePurchase} disabled={isLoading} className="w-full">
                        {isLoading ? (
                            <>
                                <Skeleton className="h-4 w-4 mr-2" /> Processing...
                            </>
                        ) : (
                            'Submit Purchase'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
            {invoiceData && (
                <PurchaseInvoice
                    company={invoiceData.company}
                    seller={invoiceData.seller}
                    purchases={invoiceData.purchases}
                />
            )}
        </Dialog>
    )
}

export default PurchaseProduct
