
import React, { useEffect, useState } from 'react';
import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

const AdBanner: React.FC = () => {
  const [isNative, setIsNative] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const checkPlatform = async () => {
      const platform = (window as any).Capacitor?.getPlatform();
      if (platform === 'android' || platform === 'ios') {
        setIsNative(true);
        try {
          await AdMob.initialize({
            requestTrackingAuthorization: true,
          });
          setIsInitialized(true);

          await AdMob.showBanner({
            adId: 'ca-app-pub-4481364556222677/9760544752', // Ensure this is your AdMob Ad Unit ID
            adSize: BannerAdSize.BANNER,
            position: BannerAdPosition.BOTTOM_CENTER,
            margin: 0,
            isTesting: false,
          });
        } catch (e) {
          console.error("AdMob Native Error:", e);
        }
      } else {
        // Web fallback
        try {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        } catch (e) {
          console.debug("Web ads initialization skipped or failed");
        }
      }
    };

    checkPlatform();

    return () => {
      if (isNative) {
        AdMob.removeBanner();
      }
    };
  }, [isNative]);

  // If native, AdMob draws the banner externally, so we return null to keep the web space clear
  // But we might want to return a sized div to prevent layout shift if the plugin doesn't overlay
  if (isNative) return null;

  return (
    <div className="w-full bg-slate-100/30 backdrop-blur-sm border border-slate-200 rounded-xl flex flex-col items-center justify-center py-2 overflow-hidden shadow-inner min-h-[60px]">
      <div className="flex flex-col items-center gap-1">
        <span className="text-[7px] text-slate-400 font-black uppercase tracking-[0.3em]">AdMob Network</span>
        <div className="w-full flex justify-center">
          {/* Real AdSense/AdMob for Web integration */}
          <ins className="adsbygoogle"
               style={{ display: 'inline-block', width: '320px', height: '50px' }}
               data-ad-client="ca-app-pub-4481364556222677"
               data-ad-slot="9760544752"></ins>
          
          {/* Debug Visual Placeholder (Remove in production if needed, or keep as fallback) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
             <span className="text-[10px] font-bold text-slate-400 italic">Sponsored Content</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdBanner;
