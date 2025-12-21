
import React, { useState } from 'react';
import { Sparkles, AlarmClock, BrainCircuit, CheckCircle2, ChevronRight } from 'lucide-react';

interface IntroProps {
  onComplete: () => void;
}

export const Intro: React.FC<IntroProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const slides = [
    {
      title: "Master Your Time",
      desc: "Stop wandering. Start finishing. Task Master Pro helps you reclaim your day with precision.",
      icon: <Sparkles className="w-16 h-16 text-indigo-600" />,
      color: "indigo"
    },
    {
      title: "AI Coaching",
      desc: "Get personalized productivity strategies from our Gemini-powered AI coach to crush your goals.",
      icon: <BrainCircuit className="w-16 h-16 text-violet-600" />,
      color: "violet"
    },
    {
      title: "Smart Alarms",
      desc: "Never miss a deadline with loud alarms and smart snooze features for critical missions.",
      icon: <AlarmClock className="w-16 h-16 text-rose-600" />,
      color: "rose"
    }
  ];

  const next = () => {
    if (step < slides.length - 1) setStep(step + 1);
    else onComplete();
  };

  const slide = slides[step];

  return (
    <div className="fixed inset-0 z-[110] bg-white flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-500">
      <div className="flex-grow flex flex-col items-center justify-center max-w-sm">
        <div className={`p-10 rounded-[3rem] bg-${slide.color}-50 mb-10 animate-in zoom-in duration-700`}>
          {slide.icon}
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">{slide.title}</h2>
        <p className="text-slate-500 text-lg leading-relaxed font-medium">
          {slide.desc}
        </p>
      </div>

      <div className="w-full max-w-sm space-y-8">
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-slate-900' : 'w-2 bg-slate-200'}`} />
          ))}
        </div>

        <button 
          onClick={next}
          className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xl shadow-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          {step === slides.length - 1 ? "Let's Begin" : "Next"}
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
