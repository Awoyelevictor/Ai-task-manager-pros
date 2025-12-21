
import React, { useState } from 'react';
import { User } from '../types';
import { Mail, Lock, User as UserIcon, Calendar, ArrowRight, Sparkles } from 'lucide-react';

interface AuthProps {
  onAuth: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    birthday: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: any) => u.email === formData.email && u.password === formData.password);
      if (user) {
        onAuth(user);
      } else {
        alert("Invalid credentials");
      }
    } else {
      const newUser: User = {
        id: crypto.randomUUID(),
        name: formData.name,
        email: formData.email,
        birthday: formData.birthday,
        password: formData.password
      };
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      onAuth(newUser);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 sm:mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex p-3 sm:p-4 rounded-3xl bg-indigo-600 mb-4 shadow-xl shadow-indigo-200">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Task Master <span className="text-indigo-600">Pro</span></h1>
          <p className="text-slate-500 font-medium mt-2 text-sm sm:text-base">Elevate your productivity with AI</p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-slate-100 animate-in fade-in zoom-in duration-500">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    required
                    type="text"
                    placeholder="Full Name"
                    className="w-full pl-12 pr-4 py-3 sm:py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-400 transition-all font-semibold text-sm sm:text-base"
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    required
                    type="date"
                    title="Your Birthday"
                    className="w-full pl-12 pr-4 py-3 sm:py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-400 transition-all font-semibold text-slate-600 text-sm sm:text-base"
                    onChange={e => setFormData({...formData, birthday: e.target.value})}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 uppercase hidden xs:block">Birthday</span>
                </div>
              </>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                required
                type="email"
                placeholder="Email Address"
                className="w-full pl-12 pr-4 py-3 sm:py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-400 transition-all font-semibold text-sm sm:text-base"
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                required
                type="password"
                placeholder="Password"
                className="w-full pl-12 pr-4 py-3 sm:py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-400 transition-all font-semibold text-sm sm:text-base"
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-3 sm:py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group"
            >
              {isLogin ? 'Login' : 'Signup'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-slate-500 font-bold text-sm hover:text-indigo-600 transition-colors"
            >
              {isLogin ? "Don't have an account? Signup" : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
