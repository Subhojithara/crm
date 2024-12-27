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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ProductPurchase } from '@/types/Product'

interface EditPurchaseProps {
    purchase: ProductPurchase;
    onEditComplete: () => void;
}

const EditPurchase: React.FC<EditPurchaseProps> = ({ purchase, onEditComplete }) => {
    const [companyId, setCompanyId] = useState<string>('');
    const [sellerId, setSellerId] = useState<string>('');
    const [productName, setProductName] = useState<string>('');
    const [productQuantity, setProductQuantity] = useState<number>(0);
    const [purchaseAmount, setPurchaseAmount] = useState<number>(0);
    const [received, setReceived] = useState<number>(0);
    const [leaf, setLeaf] = useState<number>(0);
    const [rej, setRej] = useState<number>(0);
    const [shortage, setShortage] = useState<number>(0);
    const [kantaWeight, setKantaWeight] = useState<number>(0);
    const [truckNumber, setTruckNumber] = useState<string>('');
    const [chNo, setChNo] = useState<string>('');
    const [fare, setFare] = useState<number>(0);
    const [remarks, setRemarks] = useState<string>('');
    const [companies, setCompanies] = useState<Company[]>([])
    const [sellers, setSellers] = useState<Seller[]>([])
    const { toast } = useToast()

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const companyResponse = await fetch('/api/company');
                const sellerResponse = await fetch('/api/seller');

                if (!companyResponse.ok || !sellerResponse.ok) {
                    throw new Error('Failed to fetch dropdown data');
                }

                const companyData: { companies: Company[] } = await companyResponse.json();
                const sellerData: Seller[] = await sellerResponse.json();

                setCompanies(companyData.companies);
                setSellers(sellerData);
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
            }
        };

        fetchDropdownData();
    }, []);

    useEffect(() => {
        setCompanyId(purchase.companyId.toString());
        setSellerId(purchase.sellerId.toString());
        setProductName(purchase.productName);
        setProductQuantity(purchase.productQuantity);
        setPurchaseAmount(purchase.purchaseAmount);
        setReceived(purchase.received || 0);
        setLeaf(purchase.leaf || 0);
        setRej(purchase.rej || 0);
        setShortage(purchase.shortage || 0);
        setKantaWeight(purchase.kantaWeight || 0);
        setTruckNumber(purchase.truckNumber || '');
        setChNo(purchase.chNo || '');
        setFare(purchase.fare || 0);
        setRemarks(purchase.remarks || '');
    }, [purchase]);

    const handleUpdatePurchase = async () => {
        try {
            const response = await fetch('/api/product-purchase', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: purchase.id,
                    companyId,
                    sellerId,
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
            });

            if (!response.ok) {
                throw new Error('Failed to update purchase');
            }

            toast({
                title: "Success",
                description: "Purchase updated successfully.",
            });

            onEditComplete();
        } catch (error) {
            console.error('Error updating purchase:', error);
            toast({
                title: "Error",
                description: "There was an error updating the purchase.",
                variant: "destructive"
            });
        }
    };

    return (
        <Dialog open={true} onOpenChange={onEditComplete}>
            < DialogContent className="sm:max-w-[425px]" >
                <DialogHeader>
                    <DialogTitle>Edit Purchase</DialogTitle>
                    <DialogDescription>
                        Make changes to the purchase here. Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="company" className="text-right">
                            Company
                        </Label>
                        <Select onValueChange={setCompanyId} value={companyId}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a company" />
                            </SelectTrigger>
                            <SelectContent>
                                {companies?.map((company) => (
                                    <SelectItem key={company.id} value={String(company.id)}>
                                        {company.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="seller" className="text-right">
                            Seller
                        </Label>
                        <Select onValueChange={setSellerId} value={sellerId}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a seller" />
                            </SelectTrigger>
                            <SelectContent>
                                {sellers.map((seller) => (
                                    <SelectItem key={seller.id} value={seller.id.toString()}>
                                        {seller.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="productName" className="text-right">
                            Product Name
                        </Label>
                        <Input
                            id="productName"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="productQuantity" className="text-right">
                            Product Quantity
                        </Label>
                        <Input
                            id="productQuantity"
                            type="number"
                            value={productQuantity}
                            onChange={(e) => setProductQuantity(Number(e.target.value))}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="purchaseAmount" className="text-right">
                            Purchase Amount
                        </Label>
                        <Input
                            id="purchaseAmount"
                            type="number"
                            value={purchaseAmount}
                            onChange={(e) => setPurchaseAmount(Number(e.target.value))}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="received">Received</Label>
                        <Input
                            id="received"
                            type="number"
                            value={received}
                            onChange={(e) => setReceived(Number(e.target.value))}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="leaf">Leaf</Label>
                        <Input
                            id="leaf"
                            type="number"
                            value={leaf}
                            onChange={(e) => setLeaf(Number(e.target.value))}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="rej">Rej</Label>
                        <Input
                            id="rej"
                            type="number"
                            value={rej}
                            onChange={(e) => setRej(Number(e.target.value))}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="shortage">Shortage</Label>
                        <Input
                            id="shortage"
                            type="number"
                            value={shortage}
                            onChange={(e) => setShortage(Number(e.target.value))}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="kantaWeight">Kanta Weight</Label>
                        <Input
                            id="kantaWeight"
                            type="number"
                            value={kantaWeight}
                            onChange={(e) => setKantaWeight(Number(e.target.value))}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="truckNumber">Truck Number</Label>
                        <Input
                            id="truckNumber"
                            value={truckNumber}
                            onChange={(e) => setTruckNumber(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="chNo">CH NO</Label>
                        <Input
                            id="chNo"
                            value={chNo}
                            onChange={(e) => setChNo(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="fare">Fare</Label>
                        <Input
                            id="fare"
                            type="number"
                            value={fare}
                            onChange={(e) => setFare(Number(e.target.value))}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="remarks">Remarks</Label>
                        <Input
                            id="remarks"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onEditComplete}>Cancel</Button>
                    <Button type="submit" onClick={handleUpdatePurchase}>Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditPurchase;