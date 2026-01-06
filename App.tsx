
import React, { useState, useEffect } from 'react';
import { Product, ViewState } from './types';
import Layout from './components/Layout';
import ProductForm from './components/ProductForm';
import Scanner from './components/Scanner';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import PermissionGate from './components/PermissionGate';

const STORAGE_KEY = 'inventory_pro_v1';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // تحميل البيانات وفحص الأذونات عند بدء التشغيل
  useEffect(() => {
    const initApp = async () => {
      // 1. تحميل المنتجات
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setProducts(parsed);
        } catch (e) {
          console.error("Failed to parse local storage", e);
        }
      }

      // 2. فحص حالة إذن الكاميرا
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const status = await navigator.permissions.query({ name: 'camera' as any });
          setHasPermission(status.state === 'granted');
          
          status.onchange = () => {
            setHasPermission(status.state === 'granted');
          };
        }
      } catch (err) {
        console.warn("Permissions API not supported fully", err);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  // حفظ البيانات عند أي تغيير
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    }
  }, [products, isLoading]);

  const addProduct = (product: Product) => {
    setProducts(prev => [product, ...prev]);
    setView('INVENTORY');
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    setSelectedProduct(updatedProduct);
  };

  const deleteProduct = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الموديل نهائياً؟')) {
      setProducts(prev => prev.filter(p => p.id !== id));
      if (selectedProduct?.id === id) {
        setSelectedProduct(null);
        setView('INVENTORY');
      }
    }
  };

  const handleScanSuccess = (barcode: string) => {
    const found = products.find(p => p.barcode === barcode || p.barcode.includes(barcode));
    if (found) {
      setSelectedProduct(found);
      setView('PRODUCT_DETAIL');
    } else {
      alert(`عذراً، الباركود (${barcode}) غير موجود في سجلاتك.`);
      setView('HOME');
    }
  };

  // شاشة تحميل بسيطة لمنع وميض الواجهة
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // إذا لم يتم منح الإذن بعد، أظهر بوابة الانطلاق
  if (hasPermission === false || (hasPermission === null && !localStorage.getItem('onboarding_complete'))) {
    return <PermissionGate onGranted={() => {
      setHasPermission(true);
      localStorage.setItem('onboarding_complete', 'true');
    }} />;
  }

  const renderContent = () => {
    switch (view) {
      case 'HOME':
        return (
          <div className="flex flex-col gap-6 p-4 animate-in fade-in duration-500">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-2xl font-black mb-1">لوحة التحكم</h2>
                <p className="opacity-80 text-sm font-bold">إجمالي الموديلات: {products.length}</p>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
                <svg width="140" height="140" viewBox="0 0 24 24" fill="currentColor"><path d="M3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2zm16 14H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/></svg>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <ActionButton 
                onClick={() => setView('SCANNER')} 
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/></svg>}
                label="مسح باركود"
                color="bg-blue-600"
              />
              <ActionButton 
                onClick={() => setView('ADD_PRODUCT')} 
                icon={<Plus size={28} />}
                label="إضافة موديل"
                color="bg-indigo-600"
              />
            </div>

            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-black text-gray-800">أحدث الموديلات</h3>
                <button onClick={() => setView('INVENTORY')} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">عرض الكل</button>
              </div>
              <div className="space-y-4">
                {products.slice(0, 3).map(p => (
                  <div key={p.id} onClick={() => {setSelectedProduct(p); setView('PRODUCT_DETAIL')}} className="flex items-center gap-4 active:bg-gray-50 p-2 rounded-2xl transition-colors">
                    <img src={p.image} className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
                    <div className="flex-1 min-w-0 text-right">
                        <p className="font-black text-sm text-gray-800 truncate">{p.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">{p.barcode}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-black text-blue-600 text-sm">{p.price}</p>
                      <p className="text-[8px] text-gray-400 font-bold">ر.س</p>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Plus size={24} className="text-gray-300" />
                    </div>
                    <p className="text-gray-400 text-xs font-bold">ابدأ بإضافة أول موديل للمخزن</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'ADD_PRODUCT': return <ProductForm onSave={addProduct} onCancel={() => setView('HOME')} />;
      case 'SCANNER': return <Scanner onDetected={handleScanSuccess} onCancel={() => setView('HOME')} />;
      case 'INVENTORY': return <ProductList products={products} onSelect={(p) => { setSelectedProduct(p); setView('PRODUCT_DETAIL'); }} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />;
      case 'PRODUCT_DETAIL': return selectedProduct ? <ProductDetail product={selectedProduct} onBack={() => setView('INVENTORY')} onDelete={deleteProduct} onUpdate={updateProduct} /> : null;
      default: return null;
    }
  };

  return <Layout currentView={view} setView={setView}>{renderContent()}</Layout>;
};

const ActionButton: React.FC<{onClick: () => void, icon: React.ReactNode, label: string, color: string}> = ({onClick, icon, label, color}) => (
  <button onClick={onClick} className={`${color} text-white p-7 rounded-[32px] shadow-xl flex flex-col items-center gap-4 active:scale-95 transition-all shadow-lg hover:brightness-110`}>
    <div className="p-4 bg-white/20 rounded-2xl shadow-inner">{icon}</div>
    <span className="font-black text-sm tracking-wide">{label}</span>
  </button>
);

// Added className to the destructured props and applied it to the svg element to fix the type error
const Plus = ({size, className}: {size: number, className?: string}) => (
  <svg 
    width={size} 
    height={size} 
    className={className}
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default App;
