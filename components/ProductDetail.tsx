
import React, { useEffect, useRef } from 'react';
import { ArrowRight, Download, Trash2, Box, Palette, Maximize, ShoppingBag, Share2, Camera, Edit3 } from 'lucide-react';
import { Product } from '../types';
import JsBarcode from 'jsbarcode';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onDelete: (id: string) => void;
  onUpdate: (product: Product) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack, onDelete, onUpdate }) => {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, product.barcode, {
          format: "CODE128",
          lineColor: "#000",
          width: 2,
          height: 60,
          displayValue: true,
          font: 'Cairo',
          fontSize: 14,
          margin: 10
        });
      } catch (err) {
        console.error("Barcode generation failed", err);
      }
    }
  }, [product]);

  const processAndUpdateImage = (base64Str: string) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 800;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        onUpdate({ ...product, image: compressedBase64 });
      }
    };
    img.src = base64Str;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => processAndUpdateImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const downloadBarcode = () => {
    const svg = barcodeRef.current;
    if (!svg) return;
    
    // استخدام XMLSerializer مع معالجة Unicode للأمان مع النصوص العربية
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const svgSize = svg.getBBox();
    
    // إضافة هوامش للكانفاس
    const padding = 40;
    canvas.width = svgSize.width + padding;
    canvas.height = svgSize.height + padding;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    // ترميز الـ SVG بشكل آمن للتعامل مع الأحرف الخاصة
    const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, padding/2, padding/2);
      
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `Barcode-${product.name}-${product.barcode}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="bg-white min-h-full">
      <div className="relative">
        {/* منطقة الصورة التفاعلية */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="relative aspect-[4/5] w-full cursor-pointer group overflow-hidden"
        >
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-active:scale-105" 
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
            <div className="bg-white/20 backdrop-blur-md p-6 rounded-full border border-white/30">
              <Camera className="text-white" size={40} />
            </div>
          </div>
          <div className="absolute bottom-16 left-6 w-14 h-14 bg-blue-600 text-white rounded-full flex flex-col items-center justify-center shadow-2xl active:scale-90 transition-transform z-10 border-4 border-white">
            <Camera size={24} />
            <span className="text-[8px] font-bold">تغيير</span>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
        </div>
        
        {/* شريط الإجراءات العلوي */}
        <div className="absolute top-0 inset-x-0 p-4 flex justify-between z-20">
          <button onClick={onBack} className="w-10 h-10 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center text-gray-900 shadow-sm active:scale-90 transition-transform">
            <ArrowRight size={20} />
          </button>
          <div className="flex gap-2">
            <button 
              onClick={downloadBarcode}
              title="تحميل الباركود"
              className="w-10 h-10 bg-blue-600/90 backdrop-blur-sm text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform"
            >
              <Download size={20} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(product.id); }} 
              className="w-10 h-10 bg-red-500/90 backdrop-blur-sm text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {/* بطاقة معلومات المنتج */}
        <div className="relative -mt-12 bg-white rounded-t-[40px] px-6 pt-10 pb-24 shadow-2xl z-30 border-t border-gray-100">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
          
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1 ml-4 text-right">
              <h2 className="text-2xl font-black mb-1 text-gray-800 leading-tight">{product.name}</h2>
              <p className="text-gray-400 text-xs flex items-center gap-1">
                <Edit3 size={12} />
                انقر على الصورة لتغييرها
              </p>
            </div>
            <div className="bg-blue-600 px-4 py-2 rounded-2xl shadow-lg shadow-blue-100">
              <span className="text-2xl font-black text-white">{product.price}</span>
              <span className="text-xs font-bold text-blue-100 mr-1">ر.س</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
            <DetailBadge icon={<Maximize size={18} />} label="المقاس" value={product.size} color="bg-orange-50 text-orange-600" />
            <DetailBadge icon={<Palette size={18} />} label="اللون" value={product.color} color="bg-indigo-50 text-indigo-600" />
            <DetailBadge icon={<ShoppingBag size={18} />} label="درزن" value={`${product.unitsPerDozen} قطعة`} color="bg-emerald-50 text-emerald-600" />
          </div>

          <div className="mb-8 bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
            <h3 className="font-bold mb-2 text-gray-800 text-sm">وصف الموديل</h3>
            <p className="text-gray-500 text-sm leading-relaxed italic">
              {product.description || "لا يوجد وصف إضافي لهذا الموديل."}
            </p>
          </div>

          {/* قسم الباركود */}
          <div className="bg-gray-50 rounded-3xl p-6 flex flex-col items-center border border-gray-100 mb-8">
            <h3 className="font-bold mb-4 text-gray-800">الباركود الخاص بالموديل</h3>
            <div className="bg-white p-4 rounded-2xl shadow-inner mb-4 w-full flex justify-center border border-gray-100 overflow-hidden">
              <svg ref={barcodeRef} className="max-w-full h-auto"></svg>
            </div>
            <button 
              onClick={downloadBarcode}
              className="w-full flex items-center justify-center gap-2 text-white font-bold text-sm bg-blue-600 px-6 py-4 rounded-2xl shadow-lg shadow-blue-100 active:scale-95 transition-transform"
            >
              <Download size={18} />
              تحميل ملصق الباركود (PNG)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailBadge: React.FC<{ icon: React.ReactNode, label: string, value: string, color: string }> = ({ icon, label, value, color }) => (
  <div className={`p-4 rounded-3xl ${color} flex flex-col items-center gap-2 border border-white/50 shadow-sm`}>
    {icon}
    <div className="text-center">
      <div className="text-[10px] opacity-70 font-bold mb-0.5">{label}</div>
      <div className="text-xs font-black uppercase truncate max-w-[80px]">{value}</div>
    </div>
  </div>
);

export default ProductDetail;
