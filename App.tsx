
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, LayoutList, Bell, Mic, MicOff, Trash2, CheckCircle2, AlarmClock, BellOff, X, Clock, LogOut, Sun, Moon, Sunset, PartyPopper, TreePine, Filter, SlidersHorizontal, ChevronDown, Ghost, Snowflake, Leaf, Flower, MessageSquareCode, Palette } from 'lucide-react';
import { Task, User } from './types';
import TaskItem from './components/TaskItem';
import AIModal from './components/AIModal';
import AIChatModal from './component