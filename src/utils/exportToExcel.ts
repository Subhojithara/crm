import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const exportToExcel = (data: { id: number; createdAt: string; productName: string; productQuantity: number; productPrice: number; artisanalDetails: string; updatedAt: string; updatedName: string; updatedQuantity: number; updatedPrice: number; status: string }[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data.map((item) => ({
    ID: item.id,
    'Product Creation Date': new Date(item.createdAt).toLocaleString(),
    'Product Name': item.productName,
    'Product Quantity': item.productQuantity,
    'Product Price (₹)': item.productPrice,
    'Artisanal Details': item.artisanalDetails,
    'Product Updating Date': new Date(item.updatedAt).toLocaleString(),
    'Updated Name': item.updatedName,
    'Updated Quantity': item.updatedQuantity,
    'Updated Price (₹)': item.updatedPrice,
    Status: item.status === 'DELETE' ? 'Deleted' : 'Active',
  })));

  const workbook = {
    Sheets: { 'Product Dashboard': worksheet },
    SheetNames: ['Product Dashboard'],
  };

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, `${fileName}.xlsx`);
};