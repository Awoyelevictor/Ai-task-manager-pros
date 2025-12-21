import React, { useEffect, useState } from "react";

const AdBanner: React.FC = () => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Detect Median / Native app
    const isMedianApp =
      typeof (window as any).median !== "undefined" ||
      navigator.userAgent.includes("wv");

    if (isMedianApp) {
      // Native AdMob handled by Median — DO NOTHING HERE
      setShouldShow(false);
      return;
    }

    // Web browser → allow AdSense
    setShouldShow(true);

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdMob Web Error:", e);
    }
  }, []);

  if (!shouldShow) return null;

  return (
    <div className="w-full bg-white/50 backdrop-blur-sm border border-slate-200/50 rounded-2xl flex flex-col items-center justify-center py-1 shadow-sm min-h-[60px]">
      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mb-1">
        Sponsored
      </span>

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