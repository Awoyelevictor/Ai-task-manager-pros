
import React from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  content: string;
}

const AIModal: React.FC<AIModalProps> = ({ isOpen, onClose, isLoading, content }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 fill-indigo-300" />
            <h2 className="text-xl font-bold">AI Productivity Coach</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              <p className="text-slate-500 animate-pulse font-medium">Analyzing your tasks...</p>
            </div>
          ) : (
            <div className="prose prose-slate max-w-none">
              <div 
                className="text-slate-700 leading-relaxed space-y-4 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ 
                  __html: content.replace(/\*\*(.*?)\*\*/g, '<b class="text-indigo-700">$1</b>') 
                }}
              />
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 active:scale-95 transition-all"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIModal;
