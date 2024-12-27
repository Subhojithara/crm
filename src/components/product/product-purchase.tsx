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

const PurchaseProduct = () => {
    const [companies, setCompanies] = useState<Company[] | null>(null)
    const [sellers, setSellers] = useState<Seller[]>([])
    const [selectedCompanyId, setSelectedCompanyId] = useState< number | undefined >(undefined)
    const [selectedSellerId, setSelectedSellerId] = useState< number | undefined >(undefined)
    const [error, setError] = useState<string | null>(null)
    const [productName, setProductName] = useState<string>('')
    const [productQuantity, setProductQuantity] = useState<number | undefined>(undefined)
    const [purchaseAmount, setPurchaseAmount] = useState<number | undefined>(undefined)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [searchTerm, setSearchTerm] = useState<string>('')
    const { toast } = useToast()
    const [invoiceData, setInvoiceData] = useState<{
        company: Company | null;
        seller: Seller | null;
        productName: string;
        productQuantity: number;
        purchaseAmount: number;
        received: number | null;
        leaf: number | null;
        rej: number | null;
        shortage: number | null;
        kantaWeight: number | null;
        truckNumber: string | null;
        chNo: string | null;
        fare: number | null;
        remarks: string | null;
    } | null>(null);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [received, setReceived] = useState<number | undefined>(undefined);
    const [leaf, setLeaf] = useState<number | undefined>(undefined);
    const [rej, setRej] = useState<number | undefined>(undefined);
    const [shortage, setShortage] = useState<number | undefined>(undefined);
    const [kantaWeight, setKantaWeight] = useState<number | undefined>(undefined);
    const [truckNumber, setTruckNumber] = useState<string | undefined>(undefined);
    const [chNo, setChNo] = useState<string | undefined>(undefined);
    const [fare, setFare] = useState<number | undefined>(undefined);
    const [remarks, setRemarks] = useState<string | undefined>(undefined);

    const handlePurchase = async () => {
        if (!selectedCompanyId || !selectedSellerId || !productName || !productQuantity || !purchaseAmount) {
            setError('All fields are required')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/product-purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    companyId: selectedCompanyId,
                    sellerId: selectedSellerId,
                    productName,
                    productQuantity,
                    purchaseAmount,
                    received,
                    leaf,
                    rej,
                    shortage,
                    kantaWeight,
                    truckNumber,
                    chNo,
                    fare,
                    remarks
                }),
            })

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save purchase');
            }

            toast({
                title: "Purchase Successful",
                description: "Your purchase has been saved successfully.",
            })
            // Reset form
            setSelectedCompanyId(undefined)
            setSelectedSellerId(undefined)
            setProductName('')
            setProductQuantity(undefined)
            setPurchaseAmount(0)
            setInvoiceData({
                company: companies?.find(company => company.id === selectedCompanyId) || null,
                seller: sellers.find(seller => seller.id === selectedSellerId) || null,
                productName,
                productQuantity: productQuantity || 0,
                purchaseAmount: purchaseAmount || 0,
                received: received || null,
                leaf: leaf || null,
                rej: rej || null,
                shortage: shortage || null,
                kantaWeight: kantaWeight || null,
                truckNumber: truckNumber || null,
                chNo: chNo || null,
                fare: fare || null,
                remarks: remarks || null,
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
            setIsDataLoading(true);
            try {
                const [companyResponse, sellerResponse] = await Promise.all([
                    fetch('/api/company'),
                    fetch('/api/seller')
                ])

                if (!companyResponse.ok) {
                    const errorData = await companyResponse.json();
                    throw new Error(errorData.error || 'Failed to fetch companies')
                }
                if (!sellerResponse.ok) {
                    const errorData = await sellerResponse.json();
                    throw new Error(errorData.error || 'Failed to fetch sellers')
                }

                const companiesData = await companyResponse.json()
                const sellersData = await sellerResponse.json()

                if (Array.isArray(companiesData.companies)) {
                    setCompanies(companiesData.companies)
                } else {
                    setError('Companies data is not in the expected format')
                }

                if (Array.isArray(sellersData)) {
                    setSellers(sellersData)
                } else {
                    setError('Sellers data is not an array')
                }
            } catch (err) {
                if (err instanceof Error) {
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
            < DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Purchase Product</DialogTitle>
                    <DialogDescription>Enter the details of your product purchase.</DialogDescription>
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
                                <Select onValueChange={(value) => setSelectedCompanyId(parseInt(value, 10))} value={selectedCompanyId?.toString()}>
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
                                <Select onValueChange={(value) => setSelectedSellerId(parseInt(value, 10))} value={selectedSellerId?.toString()}>
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
                            <div className="space-y-2">
                                <Label htmlFor="productName">Product Name</Label>
                                <Input
                                    id="productName"
                                    placeholder="Enter product name"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="productQuantity">Product Quantity</Label>
                                <Input
                                    id="productQuantity"
                                    type="number"
                                    placeholder="Enter quantity"
                                    value={productQuantity || ''}
                                    onChange={(e) => setProductQuantity(Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="purchaseAmount">Purchase Amount</Label>
                                <Input
                                    id="purchaseAmount"
                                    type="number"
                                    placeholder="Enter purchase amount"
                                    value={purchaseAmount || ''}
                                    onChange={(e) => setPurchaseAmount(Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="received">Received</Label>
                                <Input
                                    id="received"
                                    type="number"
                                    placeholder="Enter received quantity"
                                    value={received || ''}
                                    onChange={(e) => setReceived(Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="leaf">Leaf</Label>
                                <Input
                                    id="leaf"
                                    type="number"
                                    placeholder="Enter leaf quantity"
                                    value={leaf || ''}
                                    onChange={(e) => setLeaf(Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rej">Rej</Label>
                                <Input
                                    id="rej"
                                    type="number"
                                    placeholder="Enter rejected quantity"
                                    value={rej || ''}
                                    onChange={(e) => setRej(Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="shortage">Shortage</Label>
                                <Input
                                    id="shortage"
                                    type="number"
                                    placeholder="Enter shortage quantity"
                                    value={shortage || ''}
                                    onChange={(e) => setShortage(Number(e.target.value))}
                                />
                            </div>
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
                    company={invoiceData.company!}
                    seller={invoiceData.seller!}
                    productName={invoiceData.productName}
                    productQuantity={invoiceData.productQuantity}
                    purchaseAmount={invoiceData.purchaseAmount}
                />
            )}
        </Dialog>
    )
}

export default PurchaseProduct
