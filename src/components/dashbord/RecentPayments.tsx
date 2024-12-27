'use client'

import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Payment } from '@/types/Invoice'
import { Search } from 'lucide-react'

interface RecentPaymentsProps {
  payments: Payment[]
  paymentSearchTerm: string
  handlePaymentSearch: (term: string) => void
}

const RecentPayments: React.FC<RecentPaymentsProps> = ({
  payments,
  paymentSearchTerm,
  handlePaymentSearch,
}) => {
  return (
    <Card className="w-full mt-6">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 w-full">
          <div>
            <CardTitle className="text-2xl font-bold">Recent Payments</CardTitle>
            <CardDescription className="text-sm text-gray-500 mt-1">
              Latest payments received for invoices
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search payments..."
              value={paymentSearchTerm}
              onChange={(e) => handlePaymentSearch(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Invoice ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow
                  key={payment.id}
                  className="transition-colors hover:bg-gray-100/50"
                >
                  <TableCell className="font-medium">{payment.invoiceId}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className=" font-semibold">
                        ₹{payment.amount.toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export default RecentPayments

