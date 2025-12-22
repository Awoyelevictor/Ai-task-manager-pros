import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, LayoutList, Bell, Mic, MicOff, AlarmClock, LogOut,
  Sun, Moon, Sunset, PartyPopper, TreePine, Filter, SlidersHorizontal,
  ChevronDown, Ghost, Snowflake, Leaf, Flower, MessageSquareCode, Palette
} from 'lucide-react';
import { Task, User } from './types';
import TaskItem from './components/TaskItem';
import AIModal from './components/AIModal';
import AIChatModal from './components/AIChatModal';
import LogoStudio from './components/LogoStudio';
import { Auth } from './components/Auth';
import { Intro } from './components/Intro';
import { getAIInsights } from './services/geminiService';
import { getPersonalizedGreeting, ThemeType } from './utils/greetingHelper';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [hasSeenIntro, setHasSeenIntro] = useState(() => localStorage.getItem('hasSeenIntro') === 'true');
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [taskInput, setTaskInput] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isLogoStudioOpen, setIsLogoStudioOpen] = useState(false);
  const [aiContent, setAIContent] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeAlarm, setActiveAlarm] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  const alarmAudio = useRef<HTMLAudioElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Persist tasks & user
  useEffect(() => { localStorage.setItem('tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => {
    if (currentUser) localStorage.setItem('currentUser', JSON.stringify(currentUser));
    else localStorage.removeItem('currentUser');
  }, [currentUser]);

  // Load alarm audio
  useEffect(() => {
    alarmAudio.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
    alarmAudio.current.loop = true;
  }, []);

  // Alarm checker
  useEffect(() => {
    const interval = setInterval(() => {
      if (!currentUser) return;
      const now = new Date();
      setTasks(prevTasks => {
        let changed = false;
        const newTasks = prevTasks.map(task => {
          if (!task.completed && !task.notified && task.dueDate && task.alarmEnabled) {
            const target = new Date(task.dueDate);
            if (now >= target && now.getTime() - target.getTime() < 60000 && activeAlarm?.id !== task.id) {
              changed = true;
              setActiveAlarm(task);
              triggerSystemNotification(task);
              return { ...task, notified: true };
            }
          }
          return task;
        });
        return changed ? newTasks : prevTasks;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [activeAlarm, currentUser]);

  useEffect(() => {
    if (activeAlarm) alarmAudio.current?.play().catch(() => {});
    else {
      alarmAudio.current?.pause();
      if (alarmAudio.current) alarmAudio.current.currentTime = 0;
    }
  }, [activeAlarm]);

  const triggerSystemNotification = (task: Task) => {
    if (Notification.permission === 'granted') {
      new Notification("⏰ Task Master Alarm!", {
        body: task.text,
        icon: "https://cdn-icons-png.flaticon.com/512/2693/2693507.png",
        requireInteraction: true
      });
    }
  };

  const handleLogout = () => { if (confirm("Logout from Task Master Pro?")) setCurrentUser(null); };

  const greeting = currentUser ? getPersonalizedGreeting(currentUser) : null;
  const currentTheme: ThemeType = greeting?.theme || 'winter';

  const themeMap: Record<ThemeType, { bg: string, primary: string, accent: string, text: string, gradient: string }> = {
    spring: { bg: 'bg-emerald-50', primary: 'bg-emerald-600', accent: 'text-emerald-600', text: 'text-slate-900', gradient: 'from-emerald-500 to-teal-600' },
    summer: { bg: 'bg-amber-50', primary: 'bg-orange-500', accent: 'text-orange-500', text: 'text-slate-900', gradient: 'from-orange-400 to-amber-500' },
    autumn: { bg: 'bg-orange-50', primary: 'bg-amber-700', accent: 'text-amber-700', text: 'text-slate-900', gradient: 'from-amber-700 to-orange-800' },
    winter: { bg: 'bg-slate-50', primary: 'bg-indigo-600', accent: 'text-indigo-600', text: 'text-slate-900', gradient: 'from-indigo-600 to-indigo-800' },
    christmas: { bg: 'bg-rose-50', primary: 'bg-rose-600', accent: 'text-rose-600', text: 'text-slate-900', gradient: 'from-rose-600 to-emerald-700' },
    halloween: { bg: 'bg-slate-950', primary: 'bg-orange-600', accent: 'text-orange-500', text: 'text-slate-100', gradient: 'from-purple-900 to-orange-700' },
    birthday: { bg: 'bg-pink-50', primary: 'bg-pink-600', accent: 'text-pink-600', text: 'text-slate-900', gradient: 'from-pink-500 to-indigo-600' }
  };

  const theme = themeMap[currentTheme];

  if (!hasSeenIntro) return <Intro onComplete={() => { localStorage.setItem('hasSeenIntro', 'true'); setHasSeenIntro(true); }} />;
  if (!currentUser) return <Auth onAuth={setCurrentUser} />;

  // --- Handlers ---
  const addTask = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!taskInput.trim()) return;
    setTasks(prev => [{
      id: crypto.randomUUID(),
      text: taskInput,
      dueDate,
      completed: false,
      priority: taskPriority,
      notified: false,
      alarmEnabled: !!dueDate
    }, ...prev]);
    setTaskInput(''); setDueDate(''); setTaskPriority('medium');
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitRecognition;
    if (!SpeechRecognition) return alert("Voice recognition not supported.");
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e: any) => setTaskInput(e.results[0][0].transcript);
    recognition.start();
  };

  const updateTask = (id: string, updates: Partial<Task>) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates, notified: updates.dueDate && updates.dueDate !== t.dueDate ? false : t.notified } : t));
  const toggleTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed, notified: t.completed ? false : t.notified } : t));
  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'pending' && !task.completed) || (filterStatus === 'completed' && task.completed);
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesStatus && matchesPriority;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed === b.completed) {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      if (a.priority !== b.priority && !a.completed) return priorityWeight[b.priority] - priorityWeight[a.priority];
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return a.completed ? 1 : -1;
  });

  const handleAskAI = async () => {
    if (tasks.filter(t => !t.completed).length === 0) return alert("Add some missions first!");
    setIsAIModalOpen(true);
    setIsAILoading(true);
    try { setAIContent(await getAIInsights(tasks)); }
    catch { setAIContent("AI is resting. Try again in a moment!"); }
    finally { setIsAILoading(false); }
  };

  return (
    <div className={`fixed inset-0 flex flex-col transition-colors duration-1000 ${theme.bg} ${theme.text}`}>

      {/* HEADER */}
      <header className={`fixed top-0 left-0 z-50 w-full px-4 pt-[max(env(safe-area-inset-top),16px)] pb-4 bg-white/80 backdrop-blur-md border-b border-slate-200/50`}>
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className={`w-6 h-6 ${theme.accent}`} />
            <h1 className="text-lg sm:text-xl font-black tracking-tight">Master Pro</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsLogoStudioOpen(true)} className="p-2 text-indigo-400 bg-white rounded-full shadow-sm hover:scale-110 transition-transform">
              <Palette className="w-5 h-5" />
            </button>
            <button onClick={() => alert('Notifications not handled in Medium app')} className="p-2 text-slate-400 bg-white rounded-full shadow-sm hover:scale-110 transition-transform">
              <Bell className="w-5 h-5" />
            </button>
            <button onClick={handleLogout} className="p-2 text-rose-400 bg-white rounded-full shadow-sm hover:scale-110 transition-transform">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* SCROLLABLE MAIN */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain w-full pt-[calc(64px+env(safe-area-inset-top))] pb-[calc(96px+env(safe-area-inset-bottom))]"
      >
        <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
          {/* Your greeting card, form, filters, and task list */}
          {/* ...Keep everything else the same but remove AdBanner */}
        </div>
      </div>

      {/* FOOTER */}
      <footer className={`fixed bottom-0 left-0 z-50 w-full bg-white/95 backdrop-blur-md border-t border-slate-200/50 px-4 pt-4 pb-[max(env(safe-area-inset-bottom),16px)]`}>
        <div className="max-w-2xl mx-auto flex flex-wrap justify-center gap-3">
          <button 
            onClick={handleAskAI} 
            className={`flex-grow group relative flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl font-black text-base shadow-2xl active:scale-95 transition-all`}
          >
            <Sparkles className="w-5 h-5 animate-pulse text-indigo-400" />
            <span>DAILY STRATEGY</span>
          </button>

          <button 
            onClick={() => setIsAIChatOpen(true)}
            className={`flex-shrink-0 px-5 rounded-2xl shadow-2xl bg-gradient-to-br ${theme.gradient} text-white active:scale-90 transition-all border-2 border-white/20 flex items-center justify-center`}
            title="AI Assistant"
          >
            <MessageSquareCode className="w-6 h-6" />
          </button>
        </div>
      </footer>

      {/* Overlays like AI modal, LogoStudio, active alarms, etc. */}
      {/* ...Keep existing overlay logic */}
    </div>
  );
};

export default App;