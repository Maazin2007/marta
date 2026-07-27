'use client';

import { useState } from 'react';
import StudentAuth from './components/StudenAuth';
import ResearcherLogin from './components/ResearcherLogin';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'student' | 'researcher'>('student');

  return (
    <div className="bg-[#f6f5f4] dark:bg-[#0f0f0e] min-h-screen flex flex-col items-center justify-center p-6">
      <div className="fixed top-4 right-4"><ThemeToggle /></div>
      
      <div className="w-full max-w-[440px] bg-white dark:bg-[#1a1918] rounded-[16px] border border-[#e6e6e6] dark:border-[#2e2c2a] shadow-[0_0.175px_1.041px_rgba(0,0,0,0.01),0_0.8px_2.925px_rgba(0,0,0,0.02),0_2.025px_7.847px_rgba(0,0,0,0.027),0_4px_18px_rgba(0,0,0,0.04)] p-8">
        <div className="mb-8 flex items-end gap-1.5">
          {/* Tooth SVG icon */}
          <svg width="28" height="28" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <path d="M32 4C23.6 4 16 10.4 16 19.2c0 4 1.2 7.6 2.8 10.4L22 52c.4 2 2 3.6 4 3.6h12c2 0 3.6-1.6 4-3.6l3.2-22.4c1.6-2.8 2.8-6.4 2.8-10.4C48 10.4 40.4 4 32 4z" fill="#0075de"/>
          </svg>
          <div className="flex items-end gap-1">
            <span className="text-[28px] font-black tracking-[-1.5px] text-black dark:text-white leading-none">MARTA</span>
            {/* 'Research' sits slightly above the baseline of MARTA — use relative + -translate-y-1 */}
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#0075de] leading-none mb-[5px]">Research</span>
          </div>
        </div>

        <div className="flex border-b border-[#e6e6e6] dark:border-[#2e2c2a] mb-6">
          <button
            onClick={() => setActiveTab('student')}
            className={`pb-2 px-1 mr-6 text-[15px] ${
              activeTab === 'student'
                ? 'border-b-2 border-[#0075de] text-black dark:text-white font-medium'
                : 'text-[#615d59] dark:text-[#8a8480] hover:text-black dark:hover:text-white font-medium border-b-2 border-transparent transition-colors'
            }`}
          >
            Student
          </button>
          <button
            onClick={() => setActiveTab('researcher')}
            className={`pb-2 px-1 text-[15px] ${
              activeTab === 'researcher'
                ? 'border-b-2 border-[#0075de] text-black dark:text-white font-medium'
                : 'text-[#615d59] dark:text-[#8a8480] hover:text-black dark:hover:text-white font-medium border-b-2 border-transparent transition-colors'
            }`}
          >
            Researcher
          </button>
        </div>

        {activeTab === 'student' ? <StudentAuth /> : <ResearcherLogin />}
      </div>
    </div>
  );
}
