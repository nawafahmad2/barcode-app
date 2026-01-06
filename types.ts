
export interface Product {
  id: string;
  name: string;
  barcode: string;
  image: string; // Base64 or URL
  price: number;
  size: string;
  color: string;
  unitsPerDozen: number;
  description: string;
  createdAt: number;
}

export type ViewState = 'HOME' | 'ADD_PRODUCT' | 'SCANNER' | 'INVENTORY' | 'PRODUCT_DETAIL';
