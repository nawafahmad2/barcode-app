
import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Zap, AlertTriangle, Loader2 } from 'lucide-react';

interface ScannerProps {
  onDetected: (barcode: string) => void;
  onCancel: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onDetected, onCancel }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "reader";

  useEffect(() => {
    let isMounted = true;

    const startScanner = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("تصفحك لا يدعم الوصول للكاميرا بشكل آمن.");
        }

        const html5QrCode = new Html5Qrcode(scannerContainerId);
        scannerRef.current = html5QrCode;
        
        const config = { 
          fps: 15, 
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.0
        };

        const handleSuccess = (decodedText: string) => {
          if (isMounted && !isProcessing) {
            setIsProcessing(true);
            // إعطاء فرصة بسيطة للمستخدم لرؤية النجاح قبل الإغلاق
            setTimeout(() => {
                if (scannerRef.current?.isScanning) {
                    scannerRef.current.stop().then(() => {
                        onDetected(decodedText);
                    }).catch(console.error);
                } else {
                    onDetected(decodedText);
                }
            }, 300);
          }
        };

        // المحاولة الذكية: البدء بالكاميرا الخلفية أولاً
        try {
          await html5QrCode.start(
            { facingMode: "environment" }, 
            config, 
            handleSuccess,
            () => {}
          );
        } catch (firstErr: any) {
          console.warn("Environmental camera failed, trying fallback...", firstErr);
          
          // محاولة الحصول على قائمة الكاميرات في حال فشل التوجيه التلقائي
          const devices = await Html5Qrcode.getCameras();
          if (devices && devices.length > 0) {
            // استخدام آخر كاميرا في القائمة (غالباً ما تكون الخلفية في الأندرويد)
            const deviceId = devices[devices.length - 1].id;
            await html5QrCode.start(
              deviceId, 
              config, 
              handleSuccess,
              () => {}
            );
          } else {
            throw new Error("NotFound");
          }
        }

        if (isMounted) setIsInitializing(false);
      } catch (err: any) {
        console.error("Scanner startup error:", err);
        if (isMounted) {
          const errMsg = err?.toString() || "";
          if (errMsg.includes("Permission denied") || errMsg.includes("NotAllowedError")) {
            setError("تم رفض الوصول. يرجى تفعيل الكاميرا من إعدادات المتصفح.");
          } else if (errMsg.includes("NotFound") || errMsg.includes("device not found")) {
            setError("لم يتم العثور على كاميرا متاحة. تأكد من توصيل الكاميرا وجرب مرة أخرى.");
          } else {
            setError("تعذر تشغيل الكاميرا. قد تكون مستخدمة من قبل تطبيق آخر.");
          }
          setIsInitializing(false);
        }
      }
    };

    // تأخير بسيط لضمان استقرار الواجهة قبل البدء
    const timer = setTimeout(startScanner, 600);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error("Cleanup error:", err));
      }
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      <div className="relative flex-1 flex flex-col">
        <div className="absolute top-0 inset-x-0 p-6 z-10 flex items-center justify-between text-white bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Camera size={18} />
            </div>
            <h2 className="text-lg font-bold">ماسح الباركود</h2>
          </div>
          <button onClick={onCancel} className="bg-white/20 p-2 rounded-full backdrop-blur-sm active:scale-90 transition-transform">
            <X size={24} />
          </button>
        </div>

        <div id={scannerContainerId} className="w-full flex-1 overflow-hidden" />

        {isProcessing && (
          <div className="absolute inset-0 bg-white animate-pulse z-50 flex flex-col items-center justify-center">
            <Loader2 className="text-blue-600 animate-spin mb-4" size={40} />
            <span className="text-blue-600 font-bold">جاري معالجة الكود...</span>
          </div>
        )}

        {!isInitializing && !error && !isProcessing && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
             <div className="w-[280px] h-[180px] border-2 border-blue-400 rounded-2xl relative shadow-[0_0_0_1000px_rgba(0,0,0,0.6)]">
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-xl"></div>
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-xl"></div>
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-xl"></div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-xl"></div>
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500/50 animate-pulse"></div>
                
                <div className="absolute -bottom-12 left-0 right-0 text-center">
                  <span className="bg-black/40 text-white text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">
                    وجه المربع نحو الباركود
                  </span>
                </div>
             </div>
          </div>
        )}

        {isInitializing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="mt-4 font-semibold animate-pulse">جاري تشغيل العدسة...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/95 px-10 text-center z-50 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="text-red-500" size={40} />
            </div>
            <p className="text-xl font-bold mb-4 leading-tight">{error}</p>
            <p className="text-gray-400 text-sm mb-8 italic">يرجى التأكد من توصيل الكاميرا أو مراجعة إعدادات الخصوصية في هاتفك.</p>
            <button 
              onClick={onCancel} 
              className="w-full py-4 bg-white text-black rounded-2xl font-bold shadow-xl active:scale-95 transition-transform"
            >
              العودة للرئيسية
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scanner;
