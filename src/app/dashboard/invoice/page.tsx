import AddInvoice from '@/components/invoice/AddInvoice'
import InvoiceTable from '@/components/invoice/InvoiceTable'
import React from 'react'

const Page = () => {
  return (
    <div>
      <AddInvoice />
      <InvoiceTable />
    </div>
  )
}

export default Page