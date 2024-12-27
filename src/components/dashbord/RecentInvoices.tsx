'use client'

import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Invoice } from '@/types/Invoice'
import { FileDown, Search, ArrowRight } from 'lucide-react'

interface RecentInvoicesProps {
  invoices: Invoice[]
  searchTerm: string
  handleSearch: (term: string) => void
}

const RecentInvoices: React.FC<RecentInvoicesProps> = ({
  invoices,
  searchTerm,
  handleSearch,
}) => {
  const router = useRouter()

  const exportInvoicesToCSV = () => {
    const headers = ['Invoice ID', 'Client', 'Amount', 'Status', 'Date']
    const rows = invoices.map((invoice) => [
      invoice.id,
      invoice.client.name,
      invoice.netAmount,
      invoice.paymentStatus,
      new Date(invoice.createdAt).toLocaleDateString(),
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows].map((e) => e.join(',')).join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'recent_invoices.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleViewAllInvoices = () => {
    router.push('/dashboard/invoice/add')
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 w-full">
          <div>
            <CardTitle className="text-2xl font-bold">Recent Invoices</CardTitle>
            <CardDescription className="text-sm text-gray-500 mt-1">
              Latest transactions and their status
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by Client or ID"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            <Button variant="outline" onClick={exportInvoicesToCSV} className="w-full sm:w-auto">
              <FileDown className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Invoice ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.slice(0, 5).map((invoice) => (
                <TableRow
                  key={invoice.id}
                  className="transition-colors hover:bg-gray-100/50"
                >
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.client.name}</TableCell>
                  <TableCell>₹{invoice.netAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        invoice.paymentStatus === 'PAID'
                          ? 'default'
                          : invoice.paymentStatus === 'PENDING'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {invoice.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleViewAllInvoices} className="transition-transform hover:translate-x-1">
            View All Invoices
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default RecentInvoices
