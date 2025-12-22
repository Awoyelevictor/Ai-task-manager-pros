import React from "react";

/**
 * AdBanner
 * ----------
 * AdMob is fully handled by Median Native Plugins.
 * This component intentionally renders nothing.
 *
 * Why?
 * - Prevents Vercel build errors
 * - Avoids duplicate ads (policy-safe)
 * - Keeps web & native responsibilities separated
 */
const AdBanner: React.FC = () => {
  return null;
};

export default AdBanner;