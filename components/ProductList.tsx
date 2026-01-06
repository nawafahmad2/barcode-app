
import React from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Product } from '../types';

interface ProductListProps {
  products: Product[];
  onSelect: (product: Product) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onSelect, searchTerm, setSearchTerm }) => {
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.barcode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 bg-gray-50 min-h-full">
      <div className="mb-6 space-y-4">
        <h2 className="text-2xl font-bold">المخزن</h2>
        
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="البحث بالاسم أو الباركود..."
            className="w-full pr-12 pl-4 py-4 bg-white rounded-2xl shadow-sm border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map(product => (
            <div 
              key={product.id}
              onClick={() => onSelect(product)}
              className="bg-white rounded-3xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow active:scale-95 transition-transform"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden mb-3">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] px-2 py-1 rounded-full font-bold">
                  {product.price} ر.س
                </div>
              </div>
              <h3 className="font-bold text-sm truncate">{product.name}</h3>
              <div className="flex justify-between items-center mt-1">
                <span className="text-[10px] text-gray-400">{product.barcode}</span>
                <span className="text-[10px] font-bold text-indigo-600">{product.size}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Search size={48} className="mb-4 opacity-20" />
          <p>لا توجد منتجات مطابقة لـ "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;
