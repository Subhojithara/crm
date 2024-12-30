import React from "react";
import { Invoice, Payment } from "@/types/Invoice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface RecentActivityProps {
  invoices: Invoice[];
  payments: Payment[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({
  invoices,
  payments,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recent Invoices */}
        <div>
          <h3 className="text-lg font-semibold">Recent Invoices</h3>
          {invoices.length === 0 ? (
            <p className="text-gray-500">No recent invoices.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {invoices.slice(0, 5).map((invoice) => (
                <li key={invoice.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{invoice.client.name}</p>
                    <p className="text-gray-500 text-sm">
                      {invoice.createdAt}
                    </p>
                  </div>
                  <Badge
                    variant={
                      invoice.paymentStatus === "PAID" ? "default" : "destructive"
                    }
                  >
                    {invoice.paymentStatus}
                  </Badge>
                  <span className="font-medium">
                    {formatCurrency(invoice.netAmount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Payments */}
        <div>
          <h3 className="text-lg font-semibold">Recent Payments</h3>
          {payments.length === 0 ? (
            <p className="text-gray-500">No recent payments.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {payments.slice(0, 5).map((payment) => (
                <li key={payment.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Invoice ID: {payment.invoiceId}</p>
                    <p className="text-gray-500 text-sm">
                      {payment.createdAt}
                    </p>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(payment.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;