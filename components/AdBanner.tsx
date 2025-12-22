import React from "react";

const AdBanner: React.FC = () => {
  // Nothing is needed for web since Median handles ads natively
  return (
    <div className="w-full min-h-[60px] flex items-center justify-center text-xs text-slate-400">
      Sponsored
    </div>
  );
};

export default AdBanner;