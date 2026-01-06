
import React, { useState, useRef } from 'react';
import { Camera, X, Check, Loader2, Palette, Ruler } from 'lucide-react';
import { Product } from '../types';

interface ProductFormProps {
  onSave: (product: Product) => void;
  onCancel: () => void;
}

const PRESET_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];
const PRESET_COLORS = [
  { name: 'أسود', hex: '#000000' },
  { name: 'أبيض', hex: '#FFFFFF' },
  { name: 'أحمر', hex: '#EF4444' },
  { name: 'أزرق', hex: '#3B82F6' },
  { name: 'أخضر', hex: '#10B981' },
  { name: 'رمادي', hex: '#6B7280' },
  { name: 'بني', hex: '#78350F' },
];

const ProductForm: React.FC<ProductFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    size: '',
    color: '',
    unitsPerDozen: '12',
    description: ''
  });
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = (base64Str: string) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 800;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      
      // ضغط الصورة بصيغة JPEG بجودة 70% لتوفير مساحة التخزين
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
      setImage(compressedBase64);
    };
    img.src = base64Str;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        processImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateBarcode = () => {
    return 'ART-' + Math.floor(100000000 + Math.random() * 900000000).toString();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      alert('يرجى اختيار صورة للمنتج');
      return;
    }
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      const newProduct: Product = {
        id: crypto.randomUUID(),
        name: formData.name,
        barcode: generateBarcode(),
        image: image,
        price: parseFloat(formData.price),
        size: formData.size,
        color: formData.color,
        unitsPerDozen: parseInt(formData.unitsPerDozen),
        description: formData.description,
        createdAt: Date.now(),
      };
      
      onSave(newProduct);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="p-4 bg-white min-h-full pb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">إضافة موديل جديد</h2>
        <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Area */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="relative aspect-square w-full rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden flex flex-col items-center justify-center cursor-pointer group hover:border-blue-400 transition-colors"
        >
          {image ? (
            <>
              <img src={image} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={32} />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center text-gray-400">
              <Camera size={48} className="mb-2" />
              <p className="text-sm font-semibold">اضغط لرفع صورة المنتج</p>
            </div>
          )}
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleImageUpload}
        />

        {/* Form Fields */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">اسم الموديل</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
              placeholder="مثال: فستان سهرة مخمل"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">السعر (ر.س)</label>
              <input 
                required
                type="number" 
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                placeholder="0.00"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">عدد القطع/درزن</label>
              <input 
                required
                type="number" 
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                value={formData.unitsPerDozen}
                onChange={e => setFormData({...formData, unitsPerDozen: e.target.value})}
              />
            </div>
          </div>

          {/* Size Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <Ruler size={16} className="text-blue-500" />
              المقاس
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_SIZES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormData({...formData, size: s})}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    formData.size === s 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                    : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
              placeholder="أو اكتب مقاساً مخصصاً..."
              value={formData.size}
              onChange={e => setFormData({...formData, size: e.target.value})}
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <Palette size={16} className="text-indigo-500" />
              اللون
            </label>
            <div className="flex flex-wrap gap-3 mb-3">
              {PRESET_COLORS.map(c => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setFormData({...formData, color: c.name})}
                  title={c.name}
                  className={`w-8 h-8 rounded-full border-2 transition-transform active:scale-90 ${
                    formData.color === c.name ? 'border-blue-600 scale-110 shadow-lg' : 'border-gray-100'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
              placeholder="أو اكتب لوناً مخصصاً..."
              value={formData.color}
              onChange={e => setFormData({...formData, color: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">وصف إضافي</label>
            <textarea 
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all resize-none"
              placeholder="اكتب ملاحظات إضافية هنا..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>
        </div>

        <button 
          disabled={isSubmitting}
          type="submit"
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-transform disabled:bg-gray-400"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : <Check size={20} />}
          حفظ الموديل في المخزن
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
