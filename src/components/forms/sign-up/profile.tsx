"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { User } from "@/types/User";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { isValid } from 'date-fns';
import { Mail, Phone, Calendar, User2, ShoppingCart, FileText, CreditCard, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Customer } from "@/types/Customer";
import { Invoice } from "@/types/Invoice";
import { Payment } from "@/types/Payment";
import { ProductPurchase } from "@/types/Product";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Profile() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState<Customer[] | null>(null);
  const [invoiceData, setInvoiceData] = useState<Invoice[] | null>(null);
  const [paymentData, setPaymentData] = useState<Payment[] | null>(null);
  const [productPurchaseData, setProductPurchaseData] = useState<ProductPurchase[] | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Add states for filters
  const [invoiceFilter, setInvoiceFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const isAdmin = profile?.role === "ADMIN";

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (!isLoaded || !user?.id) return;

        const responses = await Promise.all([
          fetch(`/api/users/profile?userId=${user.id}`),
          fetch(`/api/customers?userId=${user.id}`),
          fetch(`/api/invoices?userId=${user.id}`),
          fetch(`/api/payments?userId=${user.id}`),
          fetch(`/api/product-purchase?userId=${user.id}`)
        ]);

        const [profileResponse, customerResponse, invoiceResponse, paymentResponse, productResponse] = responses;

        if (!profileResponse.ok) throw new Error("Failed to fetch profile");

        const profileData = await profileResponse.ok ? await profileResponse.json() : null;
        const customerData = await customerResponse.ok ? await customerResponse.json() : [];
        const invoiceData = await invoiceResponse.ok ? await invoiceResponse.json() : [];
        const paymentData = await paymentResponse.ok ? await paymentResponse.json() : [];
        const productData = await productResponse.ok ? await productResponse.json() : [];

        setProfile(profileData.profile);
        setCustomerData(customerData.customers);
        setInvoiceData(invoiceData);
        setPaymentData(paymentData);
        setProductPurchaseData(productData);

      } catch (error) {
        const err = error as Error;
        setError(err.message);
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isLoaded, user?.id]);

  const filterData = <T extends object>(data: T[], term: string): T[] => {
    if (!term) return data;
    return data.filter(item =>
      Object.values(item).some(value => {
        if (value === null || value === undefined) {
          return false;
        }
        return String(value).toLowerCase().includes(term.toLowerCase());
      })
    );
  };

  // Loading and error states
  if (error) {
    return (
      <div className="container mx-auto ">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-red-600">
              <FileText className="h-12 w-12" />
              <p className="text-lg font-medium">Error loading profile</p>
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto ">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-muted-foreground">
              <User2 className="h-12 w-12" />
              <p className="text-lg font-medium">Profile not found</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto pt-8">

      <Tabs defaultValue="profile" className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-4">
          <TabsList className="h-auto p-1 bg-muted/20">
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Profile
            </TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
                      {/* Admin Button */}
          {isAdmin && (
            <div className="">
              <Link href="/Admin">
                <Button variant="link">Go to Admin Page</Button>
              </Link>
            </div>
          )}
          </TabsList>


          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <TabsContent value="profile">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.imageUrl} />
                  <AvatarFallback className="text-lg">{profile.name?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl">{profile.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">@{profile.username}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {profile.role}
                    </Badge>
                    {/* Add more badges for other relevant info */}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Bio Section */}
                <div className="bg-muted/10 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">About</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {profile.bio || "No bio provided"}
                  </p>
                </div>

                {/* Contact & Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{user?.primaryEmailAddress?.emailAddress}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{profile.number || "Not provided"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Personal Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {profile.dateOfBirth && isValid(new Date(profile.dateOfBirth))
                            ? format(new Date(profile.dateOfBirth), "dd MMMM yyyy")
                            : "Not provided"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <User2 className="h-4 w-4 text-muted-foreground" />
                        <span>{profile.role}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Customers</CardTitle>
                  <CardDescription>
                    Manage your customer relationships
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {customerData && customerData.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterData(customerData, searchTerm).map((customer) => (
                        <TableRow key={customer.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell>{customer.email}</TableCell>
                          <TableCell>{customer.phone}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <User2 className="h-8 w-8 mb-2" />
                  <p>No customers found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Invoices</CardTitle>
                  <CardDescription>
                    Track your billing and payments
                  </CardDescription>
                </div>
                <Select value={invoiceFilter} onValueChange={setInvoiceFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {invoiceData && invoiceData.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>ID</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterData(invoiceData, searchTerm)
                        .filter(invoice => invoiceFilter === "all" || invoice.paymentStatus.toLowerCase() === invoiceFilter)
                        .map((invoice) => (
                          <TableRow key={invoice.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{invoice.id}</TableCell>
                            <TableCell>{invoice.client?.name}</TableCell>
                            <TableCell>₹{invoice.totalAmount.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant={invoice.paymentStatus.toLowerCase() === "paid" ? "secondary" as const : invoice.paymentStatus.toLowerCase() === "unpaid" ? "destructive" as const : "default"}>
                                {invoice.paymentStatus}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <FileText className="h-8 w-8 mb-2" />
                  <p>No invoices found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Payments</CardTitle>
                  <CardDescription>
                    View your payment history
                  </CardDescription>
                </div>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Filter method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {paymentData && paymentData.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Invoice ID</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Method</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterData(paymentData, searchTerm)
                        .filter(payment => paymentFilter === "all" || payment.paymentMethod.toLowerCase() === paymentFilter)
                        .map((payment) => (
                          <TableRow key={payment.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{payment.invoiceId}</TableCell>
                            <TableCell>₹{payment.amount.toFixed(2)}</TableCell>
                            <TableCell>
                              {format(new Date(payment.paymentDate), "dd MMM yyyy")}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {payment.paymentMethod}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <CreditCard className="h-8 w-8 mb-2" />
                  <p>No payments found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Products</CardTitle>
                  <CardDescription>
                    View your product purchase history
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {productPurchaseData && productPurchaseData.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Name</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterData(productPurchaseData, searchTerm).map((product) => (
                        <TableRow key={product.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{product.productName}</TableCell>
                          <TableCell>{product.productQuantity}</TableCell>
                          <TableCell>₹{product.purchaseAmount.toFixed(2)}</TableCell>
                          <TableCell>
                            {format(new Date(product.createdAt), "dd MMM yyyy")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <ShoppingCart className="h-8 w-8 mb-2" />
                  <p>No products found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}