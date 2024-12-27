export interface PurchaseDetail {
  id: number
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

const mockPurchaseDetails: PurchaseDetail[] = [
  {
    id: 1,
    productName: "Product A",
    quantity: 2,
    unitPrice: 10,
    totalPrice: 20,
  },
  {
    id: 2,
    productName: "Product B",
    quantity: 1,
    unitPrice: 15,
    totalPrice: 15,
  },
  {
    id: 3,
    productName: "Product C",
    quantity: 3,
    unitPrice: 5,
    totalPrice: 15,
  },
]

export const getPurchaseDetails = async (
): Promise<PurchaseDetail[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockPurchaseDetails)
    }, 500)
  })
}
