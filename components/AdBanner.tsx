
import React, { useEffect, useState } from 'react';

const AdBanner: React.FC = () => {
  const [shouldShow, setShouldShow] = useState(true);

  useEffect(() => {
    // Detect if we are running as a native APK
    const isNativeApp = window.navigator.userAgent.includes('wv') || (window as any).isNativeApp;
    
    /**
     * TOGGLE THIS:
     * Set to 'true' if you clicked "Enable" in the AdMob section of the APK Builder tool.
     * Set to 'false' if you want to use the web-based AdMob banner instead.
     */
    const useNativeApkAd = false; 

    if (useNativeApkAd && isNativeApp) {
      setShouldShow(false);
    }

    if (shouldShow) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdMob Web Error:", e);
      }
    }
  }, [shouldShow]);

  if (!shouldShow) return null;

  return (
    <div className="w-full bg-white/50 backdrop-blur-sm border border-slate-200/50 rounded-2xl flex flex-col items-center justify-center py-1 overflow-hidden shadow-sm min-h-[60px]">
      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mb-1">Sponsored Content</span>
      <div className="w-full flex justify-center">
        {/* Web-based AdMob Unit */}
        <ins className="adsbygoogle"
             style={{ display: 'inline-block', width: '320px', height: '50px' }}
             data-ad-client="ca-app-pub-4481364556222677"
             data-ad-slot="9760544752"></ins>
      </div>
    </div>
  );
};

export default AdBanner;
