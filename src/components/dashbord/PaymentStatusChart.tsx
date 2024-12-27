// "use client"

// import { TrendingUp } from "lucide-react"
// import { LabelList, RadialBar, RadialBarChart } from "recharts"

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"
// import {
//   ChartConfig,
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart"
// import { Invoice, PaymentStatus } from '@/types/Invoice';
// import { useMemo } from "react";

// interface PaymentStatusChartProps {
//   invoices: Invoice[];
// }

// const PaymentStatusChart: React.FC<PaymentStatusChartProps> = ({ invoices }) => {
//   const chartData = useMemo(() => {
//     const paidCount = invoices.filter(invoice => invoice.paymentStatus === PaymentStatus.PAID).length;
//     const unpaidCount = invoices.filter(invoice => invoice.paymentStatus === PaymentStatus.UNPAID).length;

//     // Extract product details from invoices, handling potential undefined invoiceItems
//     const productDetails = invoices.flatMap(invoice =>
//       invoice.invoiceItems?.map(item => ({
//         productName: item.productName,
//         quantity: item.quantity,
//         unit: item.unit,
//       })) ?? [] // If invoice.invoiceItems is undefined, default to an empty array
//     );

//     return [
//       { name: "Paid", count: paidCount, fill: "var(--color-paid)", productDetails },
//       { name: "Unpaid", count: unpaidCount, fill: "var(--color-unpaid)", productDetails },
//     ];
//   }, [invoices]);

//   const chartConfig = {
//     paid: {
//       label: "Paid",
//       color: "hsl(var(--chart-1))",
//     },
//     unpaid: {
//       label: "Unpaid",
//       color: "hsl(var(--chart-2))",
//     },
//   } satisfies ChartConfig

//   return (
//     <Card className="flex flex-col">
//       <CardHeader className="items-center pb-0">
//         <CardTitle>Payment Status Distribution</CardTitle>
//         <CardDescription>Overview of invoice payment statuses</CardDescription>
//       </CardHeader>
//       <CardContent className="flex-1 pb-0">
//         <ChartContainer
//           config={chartConfig}
//           className="mx-auto aspect-square max-h-[250px]"
//         >
//           <RadialBarChart
//             data={chartData}
//             startAngle={-90}
//             endAngle={380}
//             innerRadius={30}
//             outerRadius={110}
//           >
//             <ChartTooltip
//               cursor={false}
//               content={<ChartTooltipContent hideLabel nameKey="name" />}
//             />
//             <RadialBar dataKey="count" background>
//               <LabelList
//                 position="insideStart"
//                 dataKey="name"
//                 className="fill-white capitalize mix-blend-luminosity"
//                 fontSize={11}
//               />
//             </RadialBar>
//           </RadialBarChart>
//         </ChartContainer>
//       </CardContent>
//       <CardFooter className="flex-col gap-2 text-sm">
//         <div className="flex items-center gap-2 font-medium leading-none">
//           {/* You can add dynamic trending information here if available */}
//           <TrendingUp className="h-4 w-4" />
//         </div>
//         <div className="leading-none text-muted-foreground">
//           Showing payment status for the recent invoices
//         </div>
//       </CardFooter>
//     </Card>
//   );
// };

// export default PaymentStatusChart;