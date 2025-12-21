
import React, { useState, useEffect } from 'react';
import { X, Palette, Sparkles, Download, Loader2, Wand2, Box, Zap, Leaf, History, Check } from 'lucide-react';
import { generateLogo } from '../services/geminiService';

interface LogoStudioProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GeneratedIcon {
  id: string;
  url: string;
  style: string;
  timestamp: number;
}

const STYLES = [
  { id: 'minimalist', name: 'Minimalist', icon: <Box className="w-4 h-4" />, desc: 'Clean, flat, and modern' },
  { id: '3d-glossy', name: '3D Glossy', icon: <Zap className="w-4 h-4" />, desc: 'Vibrant, depth, and shine' },
  { id: 'cyberpunk', name: 'Cyberpunk', icon: <Sparkles className="w-4 h-4" />, desc: 'Neon, high-tech, dark' },
  { id: 'zen', name: 'Zen', icon: <Leaf className="w-4 h-4" />, desc: 'Soft gradients, organic' },
];

const LogoStudio: React.FC<LogoStudioProps> = ({ isOpen, onClose }) => {
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [prompt, setPrompt] = useState('A sleek checkmark integrated with a futuristic circuit pattern');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedIcon[]>([]);
  const [showDownloadToast, setShowDownloadToast] = useState(false);

  // Load history from session storage if available
  useEffect(() => {
    const savedHistory = sessionStorage.getItem('logo_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResultImage(null);
    try {
      const imgUrl = await generateLogo(selectedStyle.name, prompt);
      setResultImage(imgUrl);
      
      const newIcon: GeneratedIcon = {
        id: crypto.randomUUID(),
        url: imgUrl,
        style: selectedStyle.name,
        timestamp: Date.now()
      };
      
      const updatedHistory = [newIcon, ...history].slice(0, 5);
      setHistory(updatedHistory);
      sessionStorage.setItem('logo_history', JSON.stringify(updatedHistory));
    } catch (error) {
      alert("Nano Banana is currently overripe (busy). Please try again in a moment!");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `NanoBanana_Icon_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setShowDownloadToast(true);
    setTimeout(() => setShowDownloadToast(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
      {showDownloadToast && (
        <div className="fixed top-8 z-[210] bg-emerald-500 text-white px-6 py-3 rounded-full font-black text-sm shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4">
          <Check className="w-4 h-4" />
          DOWNLOAD STARTED
        </div>
      )}

      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-auto max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-yellow-500/10 to-transparent flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500 rounded-xl shadow-lg shadow-yellow-500/20">
              <Zap className="w-5 h-5 text-slate-900 fill-slate-900" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white leading-none">Nano Banana</h2>
              <p className="text-[10px] font-bold text-yellow-500/70 uppercase tracking-widest mt-1">Instant App Icon Studio</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8 custom-scrollbar pb-8">
          {/* Preview Area */}
          <div className="relative aspect-square w-full max-w-[200px] sm:max-w-[260px] mx-auto">
            <div className={`absolute inset-0 bg-yellow-500/10 rounded-[3rem] blur-3xl transition-all duration-1000 ${isGenerating ? 'animate-pulse opacity-100' : 'opacity-0'}`}></div>
            <div className="relative w-full h-full bg-slate-950 rounded-[2rem] sm:rounded-[3rem] border-2 border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl ring-1 ring-white/5">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-500 animate-spin" />
                    <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-white animate-pulse" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Nano Banana is cooking...</p>
                </div>
              ) : resultImage ? (
                <img src={resultImage} alt="Generated Logo" className="w-full h-full object-cover animate-in zoom-in-95 duration-500" />
              ) : (
                <div className="text-center p-8 space-y-4 opacity-30 group">
                  <Wand2 className="w-12 h-12 text-slate-500 mx-auto transition-transform group-hover:scale-110" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Awaiting Your Vision</p>
                </div>
              )}
            </div>
          </div>

          {/* Prompt Area */}
          <div className="space-y-2 sm:space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Icon Topic</label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. A futuristic lightning bolt icon..."
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 outline-none text-white text-sm font-semibold resize-none transition-all placeholder:text-slate-700"
                rows={2}
              />
            </div>
          </div>

          {/* Style Selector */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Art Direction</label>
              <span className="text-[9px] font-bold text-yellow-500/50 uppercase tracking-widest">Nano-optimized</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style)}
                  className={`flex flex-col items-start p-3 sm:p-4 rounded-2xl border-2 transition-all active:scale-95 ${
                    selectedStyle.id === style.id 
                      ? 'bg-yellow-500/5 border-yellow-500 shadow-lg shadow-yellow-500/5' 
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className={`p-2 rounded-lg mb-2 transition-colors ${selectedStyle.id === style.id ? 'bg-yellow-500 text-slate-900' : 'bg-slate-800 text-slate-400'}`}>
                    {style.icon}
                  </div>
                  <span className={`text-[10px] sm:text-[11px] font-black ${selectedStyle.id === style.id ? 'text-white' : 'text-slate-400'}`}>{style.name}</span>
                  <span className="text-[8px] sm:text-[9px] text-slate-600 font-medium leading-tight mt-0.5">{style.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* History Gallery */}
          {history.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 ml-1">
                <History className="w-3 h-3 text-slate-500" />
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recent Generations</label>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {history.map((icon) => (
                  <button
                    key={icon.id}
                    onClick={() => setResultImage(icon.url)}
                    className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-slate-800 overflow-hidden hover:border-yellow-500 transition-colors active:scale-90"
                  >
                    <img src={icon.url} className="w-full h-full object-cover" alt="History" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-950 border-t border-slate-800 flex flex-col gap-3 sm:gap-4 shadow-2xl flex-shrink-0">
          {resultImage ? (
            <div className="flex gap-3 sm:gap-4">
              <button 
                onClick={() => setResultImage(null)}
                className="flex-grow py-4 bg-slate-800 text-slate-300 rounded-2xl font-black text-xs hover:bg-slate-700 transition-all uppercase tracking-widest"
              >
                Start New
              </button>
              <button 
                onClick={handleDownload}
                className="flex-[2] py-4 bg-yellow-500 text-slate-950 rounded-2xl font-black text-xs shadow-xl shadow-yellow-500/20 hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95"
              >
                <Download className="w-4 h-4" />
                Download PNG
              </button>
            </div>
          ) : (
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-4 sm:py-5 bg-yellow-500 text-slate-950 rounded-2xl font-black text-sm sm:text-base shadow-xl shadow-yellow-500/20 disabled:opacity-50 hover:bg-yellow-400 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : <Sparkles className="w-5 h-5 fill-slate-950" />}
              {isGenerating ? 'Rendering...' : 'Generate with Nano Banana'}
            </button>
          )}
          <p className="text-center text-[8px] font-bold text-slate-600 uppercase tracking-[0.3em]">AI Engine: Gemini-2.5-Flash-Image</p>
        </div>
      </div>
    </div>
  );
};

export default LogoStudio;
