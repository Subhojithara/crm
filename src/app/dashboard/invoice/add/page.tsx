import AddInvoice from '@/components/invoice/AddInvoice'
import InvoiceTable from '@/components/invoice/InvoiceTable'
import React from 'react'

const page = () => {
  return (
    <div>
        <AddInvoice />
        <InvoiceTable />
    </div>
  )
}

export default page