"use client"

import AddSellerDialog from '@/components/seller/Add-Seller'
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import SellerTable from '@/components/seller/Seller-Table'


const Page = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Add New Seller</Button>
        </DialogTrigger>
        <AddSellerDialog setIsOpen={setIsOpen} />
      </Dialog >
      <SellerTable />
    </div>
  )
}

export default Page