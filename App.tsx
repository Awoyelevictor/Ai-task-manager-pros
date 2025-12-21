
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

  // Force scroll to top on mount to ensure header is visible
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
