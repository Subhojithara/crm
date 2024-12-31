// "use client";

// import React, { useState, useRef } from 'react';
// import { Button } from '@/components/ui/button';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import PurchaseInvoice from './PurchaseInvoice';
// import { ProductPurchase } from '@/types/Product';
// import { Company } from '@/types/Company';
// import { Seller } from '@/types/Seller';

// interface PurchaseInvoicePreviewProps {
//   purchase: ProductPurchase;
//   company: Company;
//   seller: Seller;
// }

// const PurchaseInvoicePreview: React.FC<PurchaseInvoicePreviewProps> = ({
//   purchase,
//   company,
//   seller
// }) => {
//   const [open, setOpen] = useState(false);
//   const invoiceRef = useRef<HTMLDivElement>(null);

//   return (
//     <>
//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogTrigger asChild>
//           <Button variant="outline">Preview Invoice</Button>
//         </DialogTrigger>

//         <DialogContent className="sm:max-w-[80vw] max-h-[90vh] overflow-auto">
//           <DialogHeader>
//             <DialogTitle>Purchase Invoice Preview</DialogTitle>
//             <DialogDescription>
//               Preview the purchase invoice before downloading.
//             </DialogDescription>
//           </DialogHeader>
//           <ScrollArea className="h-[70vh] w-full">
//             <div ref={invoiceRef}>
//               <PurchaseInvoice
//                 company={company}
//                 seller={seller}
//                 productName={purchase.productName}
//                 productQuantity={purchase.productQuantity}
//                 purchaseAmount={purchase.purchaseAmount}
//                 received={purchase.received || 0}
//                 leaf={purchase.leaf || 0}
//                 rej={purchase.rej || 0}
//                 shortage={purchase.shortage || 0}
//                 kantaWeight={purchase.kantaWeight || 0}
//                 truckNumber={purchase.truckNumber || ''}
//                 chNo={purchase.chNo || ''}
//                 fare={purchase.fare || 0}
//                 remarks={purchase.remarks || ''}
//               />
//             </div>
//           </ScrollArea>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// };

// export default PurchaseInvoicePreview; 