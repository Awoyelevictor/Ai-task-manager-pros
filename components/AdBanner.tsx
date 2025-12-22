import React, { useEffect, useState } from "react";

const AdBanner: React.FC = () => {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    const initAds = async () => {
      const platform = (window as any).Capacitor?.getPlatform?.();

      if (platform === "android" || platform === "ios") {
        setIsNative(true);

        try {
          const AdMobModule = await import("@capacitor-community/admob");
          const { AdMob, BannerAdSize, BannerAdPosition } = AdMobModule;

          await AdMob.initialize({});

          await AdMob.showBanner({
            adId: "ca-app-pub-4481364556222677/9760544752",
            adSize: BannerAdSize.BANNER,
            position: BannerAdPosition.BOTTOM_CENTER,
            margin: 0,
            isTesting: false,
          });
        } catch (e) {
          console.error("AdMob Native Error:", e);
        }
      } else {
        // Web fallback (AdSense)
        try {
          ((window as any).adsbygoogle =
            (window as any).adsbygoogle || []).push({});
        } catch {
          console.debug("Web ads skipped");
        }
      }
    };

    initAds();

    return () => {
      if (isNative) {
        import("@capacitor-community/admob")
          .then(m => m.AdMob.removeBanner())
          .catch(() => {});
      }
    };
  }, [isNative]);

  if (isNative) return null;

  return (
    <div className="w-full min-h-[60px] flex items-center justify-center text-xs text-slate-400">
      Sponsored
      <ins
        className="adsbygoogle"
        style={{ display: "inline-block", width: 320, height: 50 }}
        data-ad-client="ca-app-pub-4481364556222677"
        data-ad-slot="9760544752"
      />
    </div>
  );
};

export default AdBanner;