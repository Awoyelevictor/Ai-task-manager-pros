<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="theme-color" content="#4f46e5">
  <meta name="mobile-web-app-capable" content="yes">
  
  <link rel="manifest" href="./manifest.json">
  <link rel="apple-touch-icon" href="https://cdn-icons-png.flaticon.com/512/2693/2693507.png">
  
  <title>AI Task Master Pro</title>
  <script src="https://cdn.tailwindcss.com"></script>
<script type="importmap">
{
  "imports": {
    "react-dom/": "https://esm.sh/react-dom@^19.2.3/",
    "vite": "https://esm.sh/vite@^7.3.0",
    "@vitejs/plugin-react": "https://esm.sh/@vitejs/plugin-react@^5.1.2",
    "react/": "https://esm.sh/react@^19.2.3/",
    "react": "https://esm.sh/react@^19.2.3",
    "lucide-react": "https://esm.sh/lucide-react@^0.562.0",
    "@google/genai": "https://esm.sh/@google/genai@^1.34.0",
    "@capacitor-community/admob": "https://esm.sh/@capacitor-community/admob@^7.2.0"
  }
}
</script>
<style>
  html, body, #root {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden; /* Prevent native body scroll */
    -webkit-tap-highlight-color: transparent;
  }
  /* Ensure inputs don't zoom on focus */
  input, select, textarea {
    font-size: 16px !important;
  }
</style>
<link rel="stylesheet" href="/index.css">
</head>
<body class="bg-slate-50 text-slate-900 select-none">
  <div id="root"></div>
  <script type="module" src="/index.tsx"></script>
  <script>
    // Polyfill for older Android WebViews that lack crypto.randomUUID
    if (!window.crypto || !window.crypto.randomUUID) {
      window.crypto = window.crypto || {};
      window.crypto.randomUUID = function() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
          (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
      };
    }

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => console.log('SW Registered'))
          .catch(err => console.log('SW Failed', err));
      });
    }
  </script>
</body>
</html>