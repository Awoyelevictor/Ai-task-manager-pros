
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Sparkles, LayoutList, Calendar, Bell, Mic, MicOff, Trash2, CheckCircle2, AlarmClock, BellOff, X, Clock, LogOut, Sun, Moon, Sunset, PartyPopper, TreePine, Filter, SlidersHorizontal, ChevronDown, Ghost, Snowflake, Leaf, Flower, MessageSquareCode, Palette } from 'lucide-react';
import { Task, User } from './types';
import TaskItem from './components/TaskItem';
import AIModal from './components/AIModal';
import AIChatModal from './components/AIChatModal';
import LogoStudio from './components/LogoStudio';
import AdBanner from './components/AdBanner';
import { Auth } from './components/Auth';
import { Intro } from './components/Intro';
import { getAIInsights } from './services/geminiService';
import { getPersonalizedGreeting, ThemeType } from './utils/greetingHelper';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [hasSeenIntro, setHasSeenIntro] = useState(() => {
    return localStorage.getItem('hasSeenIntro') === 'true';
  });
  
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
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>('default');
  const [activeAlarm, setActiveAlarm] = useState<Task | null>(null);
  
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  const alarmAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    alarmAudio.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
    alarmAudio.current.loop = true;
    if ("Notification" in window) {
      setNotificationStatus(Notification.permission);
    }
  }, []);

  const requestPermissions = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
    }
    alarmAudio.current?.play().then(() => {
      alarmAudio.current?.pause();
      alarmAudio.current!.currentTime = 0;
    }).catch(() => console.log("Audio unlock failed"));
  };

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
    if (activeAlarm) {
      alarmAudio.current?.play().catch(e => console.log("Audio blocked", e));
    } else {
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

  const handleLogout = () => {
    if (confirm("Logout from Task Master Pro?")) {
      setCurrentUser(null);
    }
  };

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

  const addTask = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!taskInput.trim()) return;
    setTasks(prev => [{
      id: crypto.randomUUID(),
      text: taskInput,
      dueDate: dueDate,
      completed: false,
      priority: taskPriority,
      notified: false,
      alarmEnabled: !!dueDate
    }, ...prev]);
    setTaskInput('');
    setDueDate('');
    setTaskPriority('medium');
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

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates, notified: updates.dueDate && updates.dueDate !== t.dueDate ? false : t.notified } : t));
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed, notified: t.completed ? false : t.notified } : t));
  };

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
    try {
      const insight = await getAIInsights(tasks);
      setAIContent(insight);
    } catch (err) {
      setAIContent("AI is resting. Try again in a moment!");
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <div className={`flex flex-col min-h-screen max-w-2xl mx-auto pb-52 relative transition-colors duration-1000 ${theme.bg} ${theme.text}`}>
      {/* Alarm Overlay */}
      {activeAlarm && (
        <div className={`fixed inset-0 z-[120] ${theme.primary} flex items-center justify-center p-6 text-white animate-in fade-in zoom-in duration-300`}>
          <div className="text-center space-y-8 max-w-sm w-full">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping scale-150"></div>
              <div className="bg-white text-slate-900 p-8 rounded-full shadow-2xl relative z-10">
                <AlarmClock className={`w-20 h-20 animate-bounce ${theme.accent}`} strokeWidth={3} />
              </div>
            </div>
            <h2 className="text-4xl font-black tracking-tighter uppercase italic">Time's Up!</h2>
            <p className="text-xl font-bold opacity-90">{activeAlarm.text}</p>
            <div className="grid gap-4 pt-8">
              <button onClick={() => { toggleTask(activeAlarm.id); setActiveAlarm(null); }} className="bg-white text-slate-900 py-5 rounded-3xl font-black text-xl shadow-xl active:scale-95 transition-all uppercase tracking-widest">Mission Complete</button>
              <button onClick={() => setActiveAlarm(null)} className="text-white/60 font-bold uppercase tracking-widest text-xs">Snooze / Dismiss</button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Greeting */}
      <header className="p-4 sm:p-6 pb-2 space-y-4 sm:space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className={`w-6 h-6 ${theme.accent}`} />
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">Master Pro</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsLogoStudioOpen(true)} className="p-2 text-indigo-400 bg-white rounded-full shadow-sm hover:scale-110 transition-transform">
              <Palette className="w-5 h-5" />
            </button>
            <button onClick={requestPermissions} className="p-2 text-slate-400 bg-white rounded-full shadow-sm hover:scale-110 transition-transform">
              <Bell className="w-5 h-5" />
            </button>
            <button onClick={handleLogout} className="p-2 text-rose-400 bg-white rounded-full shadow-sm hover:scale-110 transition-transform">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Greeting Hero */}
        <div className={`bg-gradient-to-br ${theme.gradient} rounded-[2rem] p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden group`}>
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute bottom-4 right-4 opacity-10">
            {currentTheme === 'winter' && <Snowflake className="w-24 h-24" />}
            {currentTheme === 'spring' && <Flower className="w-24 h-24" />}
            {currentTheme === 'summer' && <Sun className="w-24 h-24" />}
            {currentTheme === 'autumn' && <Leaf className="w-24 h-24" />}
            {currentTheme === 'halloween' && <Ghost className="w-24 h-24" />}
            {currentTheme === 'christmas' && <TreePine className="w-24 h-24" />}
            {currentTheme === 'birthday' && <PartyPopper className="w-24 h-24" />}
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black">{greeting?.text}</h2>
              <p className="text-white/80 text-sm sm:text-base font-medium">{greeting?.subtext}</p>
            </div>
            <div className="bg-white/20 p-3 sm:p-4 rounded-3xl backdrop-blur-md hidden xs:block">
              {greeting?.icon === 'sun' && <Sun className="w-6 h-6 sm:w-8 sm:h-8" />}
              {greeting?.icon === 'sunset' && <Sunset className="w-6 h-6 sm:w-8 sm:h-8" />}
              {greeting?.icon === 'moon' && <Moon className="w-6 h-6 sm:w-8 sm:h-8" />}
              {greeting?.icon === 'party' && <PartyPopper className="w-6 h-6 sm:w-8 sm:h-8" />}
              {greeting?.icon === 'holiday' && (currentTheme === 'christmas' ? <TreePine className="w-6 h-6 sm:w-8 sm:h-8" /> : <Ghost className="w-6 h-6 sm:w-8 sm:h-8" />)}
            </div>
          </div>
        </div>

        {/* Input Card - Responsive Layout */}
        <form onSubmit={addTask} className="bg-white p-4 sm:p-5 rounded-3xl shadow-xl border border-slate-100 space-y-3 sm:space-y-4">
          <div className="flex gap-3">
            <div className="flex-grow relative group">
              <LayoutList className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="text" value={taskInput} onChange={(e) => setTaskInput(e.target.value)} placeholder="Next objective..." className="w-full pl-12 pr-12 py-3 sm:py-4 bg-slate-50/50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-400 transition-all text-slate-800 font-semibold text-sm sm:text-base" />
              <button type="button" onClick={startVoiceInput} className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${isListening ? 'bg-rose-100 text-rose-600 animate-pulse' : 'text-slate-400 hover:text-indigo-500'}`}>{isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}</button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3">
            <div className="relative group col-span-1 sm:col-auto sm:min-w-[120px]">
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value as any)} className="appearance-none w-full pl-3 sm:pl-4 pr-8 sm:pr-10 py-3 bg-slate-50/50 border-none rounded-xl text-xs font-bold text-slate-600 focus:ring-2 focus:ring-indigo-400 cursor-pointer">
                <option value="low">Low Priority</option>
                <option value="medium">Medium</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            
            <input 
              type="datetime-local" 
              value={dueDate} 
              onChange={(e) => setDueDate(e.target.value)} 
              className="col-span-1 sm:col-auto sm:flex-grow pl-3 sm:pl-4 pr-3 py-3 bg-slate-50/50 border-none rounded-xl text-xs font-bold text-slate-600 min-w-0" 
            />
            
            <button type="submit" className={`col-span-2 sm:col-auto ${theme.primary} text-white px-6 sm:px-8 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-transform text-sm sm:text-base mt-1 sm:mt-0`}>
              Add
            </button>
          </div>
        </form>
      </header>

      <main className="p-4 sm:p-6">
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-2 mb-2 opacity-60"><SlidersHorizontal className="w-4 h-4" /><h3 className="text-xs font-black uppercase tracking-widest">Filter Vault</h3></div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex bg-white/50 p-1 rounded-xl shadow-sm border border-slate-100 overflow-x-auto no-scrollbar">
              {(['all', 'pending', 'completed'] as const).map((status) => (
                <button key={status} onClick={() => setFilterStatus(status)} className={`flex-shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${filterStatus === status ? `${theme.primary} text-white shadow-md` : 'text-slate-500 hover:text-indigo-600'}`}>{status}</button>
              ))}
            </div>
            <div className="flex bg-white/50 p-1 rounded-xl shadow-sm border border-slate-100 overflow-x-auto no-scrollbar">
              {(['all', 'high', 'medium', 'low'] as const).map((priority) => (
                <button key={priority} onClick={() => setFilterPriority(priority)} className={`flex-shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${filterPriority === priority ? `${theme.primary} text-white shadow-md` : 'text-slate-500 hover:text-indigo-600'}`}>{priority === 'all' ? 'All' : priority}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg sm:text-xl font-bold">{filterStatus === 'all' ? 'Your Missions' : `${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Missions`}<span className="ml-2 text-sm opacity-50 font-medium">({sortedTasks.length})</span></h2>
          {tasks.filter(t => t.completed).length > 0 && filterStatus !== 'pending' && (
            <button onClick={() => setTasks(t => t.filter(x => !x.completed))} className="text-xs font-bold text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors">Clear Done</button>
          )}
        </div>

        <div className="space-y-3">
          {sortedTasks.length === 0 ? (
            <div className="py-20 text-center space-y-4 opacity-30"><div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm"><Filter className="w-8 h-8" /></div><p className="text-sm font-bold">No missions found</p></div>
          ) : (
            sortedTasks.map(task => <TaskItem key={task.id} task={task} onToggle={toggleTask} onUpdate={updateTask} onDelete={deleteTask} />)
          )}
        </div>
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 flex flex-col gap-4 z-40 pointer-events-none bg-gradient-to-t from-slate-50/90 to-transparent">
        <div className="flex justify-center items-end gap-3 pointer-events-auto max-w-2xl mx-auto w-full">
          <button 
            onClick={handleAskAI} 
            className={`flex-grow group relative flex items-center justify-center gap-2 sm:gap-3 py-4 sm:py-5 bg-slate-900 text-white rounded-2xl font-black text-base sm:text-lg shadow-2xl active:scale-95 transition-all`}
          >
            <Sparkles className="w-5 h-5 animate-pulse text-indigo-400" />
            <span>DAILY STRATEGY</span>
          </button>
          
          <button 
            onClick={() => setIsAIChatOpen(true)}
            className={`flex-shrink-0 p-4 sm:p-5 rounded-2xl shadow-2xl bg-gradient-to-br ${theme.gradient} text-white active:scale-90 transition-all border-2 border-white/20`}
            title="AI Assistant"
          >
            <MessageSquareCode className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </div>
        
        <div className="w-full max-w-2xl mx-auto pointer-events-auto">
          <AdBanner />
        </div>
      </div>

      <AIModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} isLoading={isAILoading} content={aiContent} />
      <AIChatModal isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} userName={currentUser.name} />
      <LogoStudio isOpen={isLogoStudioOpen} onClose={() => setIsLogoStudioOpen(false)} />
    </div>
  );
};

export default App;
