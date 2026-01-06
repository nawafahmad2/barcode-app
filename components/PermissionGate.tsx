
import React, { useState } from 'react';
import { Camera, ShieldCheck, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

interface PermissionGateProps {
  onGranted: () => void;
}

const PermissionGate: React.FC<PermissionGateProps> = ({ onGranted }) => {
  const [step, setStep] = useState<'INITIAL' | 'DENIED'>('INITIAL');
  const [loading, setLoading] = useState(false);

  const requestCamera = async () => {
    setLoading(true);
    try {
      let stream: MediaStream;
      
      try {
        // المحاولة الأولى: طلب الكاميرا الخلفية (مثالية لمسح الباركود)
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
      } catch (err: any) {
        // إذا فشل الطلب بسبب عدم وجود كاميرا خلفية (مثل أجهزة الديسكتوب)، نطلب أي كاميرا متاحة
        console.warn("Environment camera not found, falling back to default camera...");
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: true 
        });
      }
      
      // إيقاف المسار فوراً لأنه مجرد فحص للإذن
      stream.getTracks().forEach(track => track.stop());
      
      // الانتقال للتطبيق بسلاسة
      onGranted();
    } catch (err: any) {
      console.error("Permission denied or device not found", err);
      // إذا كان الخطأ هو رفض الإذن أو عدم وجود جهاز كاميرا إطلاقاً
      setStep('DENIED');
    } finally {
      setLoading(false);
    }
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (step === 'DENIED') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 mx-auto">
          <AlertCircle className="text-red-500" size={40} />
        </div>
        <h2 className="text-xl font-bold mb-4 text-gray-900">عذراً، تعذر الوصول للكاميرا</h2>
        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
          تأكد من وجود كاميرا متصلة بجهازك، ومن أنك منحت المتصفح إذن الوصول الكافي.
        </p>

        <div className="bg-gray-50 rounded-3xl p-6 mb-8 text-right w-full border border-gray-100">
          <h3 className="font-bold text-blue-700 text-sm mb-3">حلول مقترحة:</h3>
          <ul className="text-xs text-gray-600 space-y-2 list-disc list-inside">
            <li>تأكد من عدم استخدام الكاميرا في تطبيق آخر.</li>
            {isIOS ? (
              <>
                <li>اضغط على <span className="font-bold text-black">"AA"</span> في شريط العنوان.</li>
                <li>اختر <span className="font-bold text-black">إعدادات موقع الويب</span> وتأكد من سماح الكاميرا.</li>
              </>
            ) : (
              <>
                <li>اضغط على <span className="font-bold text-black">أيقونة القفل</span> بجانب الرابط.</li>
                <li>تأكد من تفعيل <span className="font-bold text-blue-600">الكاميرا</span> في أذونات الموقع.</li>
              </>
            )}
          </ul>
        </div>

        <button 
          onClick={() => window.location.reload()}
          className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
        >
          إعادة محاولة الاتصال
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between p-10 text-center max-w-md mx-auto overflow-hidden">
      <div className="mt-12 space-y-6 animate-in slide-in-from-top-8 duration-1000">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-blue-600 rounded-[30px] rotate-12 absolute inset-0 opacity-10 animate-pulse"></div>
          <div className="w-24 h-24 bg-blue-600 rounded-[30px] flex items-center justify-center shadow-2xl shadow-blue-200 relative z-10">
            <Camera className="text-white" size={40} />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">مرحباً بك</h1>
          <p className="text-gray-400 font-medium">نظام إدارة المخزون الذكي</p>
        </div>
      </div>

      <div className="space-y-4 animate-in fade-in duration-1000 delay-300">
        <div className="flex items-center gap-4 text-right bg-blue-50/50 p-4 rounded-2xl border border-blue-50">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <ShieldCheck className="text-blue-600" size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-800">تفعيل الكاميرا</h4>
            <p className="text-[10px] text-gray-500">مطلوب لمسح الباركود الخاص بالموديلات</p>
          </div>
        </div>
      </div>

      <div className="w-full space-y-6 animate-in slide-in-from-bottom-8 duration-700 delay-500">
        <button 
          onClick={requestCamera}
          disabled={loading}
          className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-100 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:bg-blue-400"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <>
              بدء الاستخدام الآن
              <ArrowLeft size={20} className="rotate-180" />
            </>
          )}
        </button>
        <p className="text-[10px] text-gray-300 font-bold tracking-widest uppercase">
          يرجى الموافقة على طلب المتصفح للوصول للكاميرا
        </p>
      </div>
    </div>
  );
};

export default PermissionGate;
