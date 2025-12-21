
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Image as ImageIcon, Sparkles, User, Bot, Loader2, Paperclip } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessageToAI } from '../services/geminiService';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose, userName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage({
          data: (reader.result as string).split(',')[1],
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const userParts: any[] = [];
    if (input.trim()) userParts.push({ text: input });
    if (selectedImage) userParts.push({ inlineData: selectedImage });

    const newUserMsg: ChatMessage = {
      role: 'user',
      parts: userParts,
      timestamp: Date.now()
    };

    const newHistory = [...messages, newUserMsg];
    setMessages(newHistory);
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const responseText = await sendMessageToAI(newHistory);
      setMessages(prev => [...prev, {
        role: 'model',
        parts: [{ text: responseText }],
        timestamp: Date.now()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'model',
        parts: [{ text: "Sorry, I encountered an error. Please try again." }],
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-black text-slate-900 leading-tight">Assistant</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Intelligence</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <X className="w-6 h-6 text-slate-400" />
        </button>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-6 bg-slate-50/30">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center max-w-xs mx-auto space-y-4">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-2">
              <Bot className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-800">Hi {userName}!</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              I'm your AI Task Assistant. Ask me anything about your productivity, recipes, or how to use this app.
            </p>
            <div className="grid grid-cols-1 gap-2 w-full mt-4">
              {['How to cook rice?', 'Explain prioritizing', 'Motivation for today'].map(tip => (
                <button 
                  key={tip}
                  onClick={() => setInput(tip)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-indigo-300 transition-all text-left"
                >
                  "{tip}"
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-indigo-600 text-white'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm font-medium shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-slate-900 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                }`}>
                  {msg.parts.map((part, pi) => (
                    <div key={pi} className="space-y-2">
                      {part.text && (
                        <div 
                          className="prose prose-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ 
                            __html: part.text
                              .replace(/\*\*(.*?)\*\*/g, '<b class="font-black text-indigo-500">$1</b>')
                              .replace(/\n/g, '<br/>') 
                          }}
                        />
                      )}
                      {part.inlineData && (
                        <img 
                          src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`} 
                          className="rounded-lg max-w-full h-auto mt-2 border border-slate-200"
                          alt="Uploaded content"
                        />
                      )}
                    </div>
                  ))}
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-100 bg-white space-y-3">
        {selectedImage && (
          <div className="flex items-center gap-2 animate-in slide-in-from-bottom-2">
            <div className="relative">
              <img 
                src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`} 
                className="w-16 h-16 object-cover rounded-xl border-2 border-indigo-500"
              />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full p-1 shadow-lg"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase italic">Image Attached</p>
          </div>
        )}
        <div className="flex items-end gap-3">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3.5 bg-slate-50 text-slate-400 rounded-2xl hover:text-indigo-600 hover:bg-indigo-50 transition-all flex-shrink-0 border border-slate-100"
          >
            <Paperclip className="w-6 h-6" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageSelect} 
            accept="image/*" 
            className="hidden" 
          />
          <div className="flex-grow relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="w-full pl-5 pr-14 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-400 transition-all text-slate-800 font-semibold resize-none max-h-32"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && !selectedImage)}
              className="absolute right-2 bottom-2 p-2.5 bg-slate-900 text-white rounded-xl shadow-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatModal;
