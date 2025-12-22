import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../types';
import { CheckCircle2, Circle, Trash2, Clock, AlertTriangle, Save, X, Bell, BellOff, ChevronDown } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editDate, setEditDate] = useState(task.dueDate);
  const [editPriority, setEditPriority] = useState(task.priority);
  const inputRef = useRef<HTMLInputElement>(null);

  const isOverdue = !task.completed && task.dueDate && new Date(task.dueDate) < new Date();
  const isDueSoon = !task.completed && task.dueDate && !isOverdue && (new Date(task.dueDate).getTime() - new Date().getTime()) < 3600000;

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate(task.id, { text: editText, dueDate: editDate, priority: editPriority });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(task.text);
    setEditDate(task.dueDate);
    setEditPriority(task.priority);
    setIsEditing(false);
  };

  const toggleAlarm = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(task.id, { alarmEnabled: !task.alarmEnabled });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'text-rose-500 bg-rose-50 border-rose-100';
      case 'medium': return 'text-amber-500 bg-amber-50 border-amber-100';
      case 'low': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      default: return 'text-slate-400 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div 
      className={`group relative flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl transition-all duration-300 border ${
        task.completed 
          ? 'bg-slate-50 border-slate-100 opacity-60' 
          : 'bg-white border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5'
      }`}
    >
      <button 
        onClick={() => !isEditing && onToggle(task.id)}
        disabled={isEditing}
        className="flex-shrink-0 relative focus:outline-none disabled:opacity-50 min-w-[32px] min-h-[32px] flex items-center justify-center"
      >
        <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 transition-all flex items-center justify-center ${
          task.completed 
            ? 'bg-indigo-500 border-indigo-500 scale-110' 
            : 'border-slate-200 group-hover:border-indigo-300'
        }`}>
          {task.completed ? (
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={3} />
          ) : (
            <div className="w-2 h-2 rounded-full bg-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </button>

      <div className="flex-grow min-w-0">
        {isEditing ? (
          <div className="space-y-3 animate-in fade-in slide-in-from-left-2">
            <input
              ref={inputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={onKeyDown}
              className="w-full bg-slate-50 px-3 py-3 rounded-xl text-sm font-bold border-2 border-indigo-200 focus:border-indigo-500 focus:ring-0 outline-none"
            />
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <div className="relative group flex-1">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="datetime-local"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border-none rounded-xl text-xs font-black text-slate-600 outline-none"
                  />
                </div>
                
                <div className="relative group flex-1">
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as any)}
                    className="w-full appearance-none pl-3 pr-7 py-2 bg-slate-50 border-none rounded-xl text-xs font-black text-slate-600 outline-none capitalize"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={handleSave} className="flex-1 p-3 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors flex items-center justify-center">
                  <Save className="w-5 h-5" />
                </button>
                <button onClick={handleCancel} className="flex-1 p-3 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center justify-center">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div 
            className="cursor-pointer select-none group/text" 
            onClick={() => !task.completed && setIsEditing(true)}
          >
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
            
            <h3 className={`text-sm sm:text-base font-bold transition-all break-words leading-tight ${
              task.completed ? 'text-slate-400 line-through decoration-2' : 'text-slate-800'
            }`}>
              {task.text}
            </h3>
            
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
              {task.dueDate && (
                <div className={`flex items-center gap-1.5 mt-1 text-[10px] font-black uppercase tracking-widest ${
                  isOverdue ? 'text-rose-500' : isDueSoon ? 'text-amber-500' : 'text-slate-400'
                }`}>
                  {isOverdue ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {new Date(task.dueDate).toLocaleString([], { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              )}
              {task.dueDate && !task.completed && (
                <button 
                  onClick={toggleAlarm}
                  className={`mt-1 p-1.5 -ml-1.5 rounded-lg transition-colors ${task.alarmEnabled ? 'text-indigo-500 bg-indigo-50' : 'text-slate-300 hover:text-slate-400'}`}
                >
                  {task.alarmEnabled ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {!isEditing && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="flex-shrink-0 p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      )}

      {!task.completed && !isEditing && (
        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-opacity ${
          task.priority === 'high' ? 'bg-rose-500' : task.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
        }`}></div>
      )}
    </div>
  );
};

export default TaskItem;