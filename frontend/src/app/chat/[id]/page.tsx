'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NotesPanel from '@/components/NotesPanel';
import { PatientIntakeCard } from '@/components/PatientIntakeCard';
import ThemeToggle from '@/components/ThemeToggle';
import { PostDiagnosisSurvey, FeedbackPayload } from '@/components/PostDiagnosisSurvey';
import { DynamicVoiceIsland } from '@/components/DynamicVoiceIsland';
import { Volume2, VolumeX } from 'lucide-react';

interface Message {
  id: string;
  sender: 'STUDENT' | 'PATIENT';
  text: string;
  sentAt: string;
  failed?: boolean;
}

interface CaseData {
  title: string;
  difficulty: string;
  presentingComplaint?: string;
  caseId: string;
  sessionId?: string;
  caseNumber?: number;
  status?: string;
  startedAt?: string;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [diagnosisReached, setDiagnosisReached] = useState(false);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [isPatientTalking, setIsPatientTalking] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Load case data from sessionStorage (stashed by student dashboard before routing)
  useEffect(() => {
    if (!sessionId) return;
    const raw = sessionStorage.getItem(`marta_case_${sessionId}`);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setCaseData(parsed);
        if (parsed.status === 'PENDING_FEEDBACK') {
          setIsSurveyOpen(true);
        }
        if (parsed.status === 'COMPLETED' || parsed.status === 'FAILED') {
          setDiagnosisReached(true);
        }
      } catch {
        // malformed — leave caseData null, UI handles gracefully
      }
    }
  }, [sessionId]);

  useEffect(() => {
    const fetchMessages = async () => {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        router.push('/');
        return;
      }

      try {
        const res = await fetch(`/marta/api/v1/chat/${sessionId}/messages`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) {
          console.error('Failed to load messages:', res.status);
          throw new Error('LOAD_FAILED');
        }

        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          setMessages(data);
        } else {
          console.error('Unexpected content-type from /messages');
          throw new Error('LOAD_FAILED');
        }
      } catch (err: unknown) {
        console.error('fetchMessages error:', err);
        setError('We couldn\'t load this session. Please go back and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      fetchMessages();
    }
  }, [sessionId, router]);

  useEffect(() => {
    if (!caseData?.startedAt || caseData.status === 'COMPLETED' || caseData.status === 'FAILED' || isSurveyOpen) return;

    const calculateTimeLeft = () => {
      // Parse without 'Z' so the browser assumes local time (since backend is running locally)
      const startTime = new Date(caseData.startedAt!).getTime();
      const now = Date.now();
      const elapsed = now - startTime;
      const totalTime = 10 * 60 * 1000; // 10 minutes
      const remaining = Math.max(0, totalTime - elapsed);
      
      setTimeLeft(remaining);

      if (remaining === 0) {
        setDiagnosisReached(true);
        setIsSurveyOpen(true);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [caseData, isSurveyOpen]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isTyping || diagnosisReached) return;

    const token = localStorage.getItem('jwt_token');
    if (!token) {
      router.push('/');
      return;
    }

    setInputValue('');
    setIsTyping(true);
    setSendError(null);

    const tempId = Date.now().toString();
    const optimisticMessage: Message = {
      id: tempId,
      sender: 'STUDENT',
      text: messageText,
      sentAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const res = await fetch(`/marta/api/v1/chat/${sessionId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: messageText })
      });

      if (res.status === 429) {
        setSendError('Please wait a moment before sending another message.');
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, failed: true } : m));
        return;
      }

      if (res.status === 400) {
        // Check internally if the session is completed — never show raw backend text
        const contentType = res.headers.get('content-type');
        const errData = contentType?.includes('application/json') ? await res.json() : null;
        
        if (errData?.text === 'TIME_UP') {
          // The backend strictly enforces the 10-minute timer and rejected the message
          setDiagnosisReached(true);
          setIsSurveyOpen(true);
          setMessages(prev => prev.filter(m => m.id !== tempId));
          return;
        }
        
        const errMsg: string = errData?.message || errData?.error || '';
        console.error('400 from /message:', errMsg);
        if (errMsg.toLowerCase().includes('completed') || errMsg.toLowerCase().includes('diagnosis')) {
          setDiagnosisReached(true);
        } else {
          setSendError('Failed to send message: ' + errMsg);
        }
        return;
      }

      if (!res.ok) {
        setSendError('Failed to send message. Please try again.');
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, failed: true } : m));
        return;
      }

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.caseCompleted) {
          setDiagnosisReached(true);
          // Only save the student's message, ignore the patient's final confused reply
          setMessages(prev => [
            ...prev.filter(m => m.id !== tempId),
            { ...optimisticMessage, id: tempId + '_sent' }
          ]);
        } else {
          // Standard flow: add both student message and patient reply
          setMessages(prev => [
            ...prev.filter(m => m.id !== tempId),
            { ...optimisticMessage, id: tempId + '_sent' },
            data
          ]);

          // Text-To-Speech for patient reply
          if (isVoiceEnabled && data && data.text && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(data.text);
            utterance.onstart = () => setIsPatientTalking(true);
            utterance.onend = () => setIsPatientTalking(false);
            utterance.onerror = () => setIsPatientTalking(false);
            window.speechSynthesis.speak(utterance);
          }
        }
      } else {
        setSendError('Failed to send message. Please try again.');
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, failed: true } : m));
      }

    } catch {
      setSendError('Network error. Please try again.');
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, failed: true } : m));
    } finally {
      setIsTyping(false);
    }
  };

  const handleSurveySubmit = async (payload: FeedbackPayload) => {
    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch('/marta/api/v1/feedback/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        router.push('/student-dashboard');
      } else {
        alert('Failed to submit survey.');
      }
    } catch (e) {
      alert('Network error submitting survey.');
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleRetry = (msg: Message) => {
    setMessages(prev => prev.filter(m => m.id !== msg.id));
    setInputValue(msg.text);
    setSendError(null);
  };

  // Handle keyboard shortcut: Enter sends, Shift+Enter inserts newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as unknown as React.FormEvent);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-[#f6f5f4] flex items-center justify-center flex-col gap-3">
        <div className="w-5 h-5 border-2 border-[#e6e6e6] border-t-[#0075de] rounded-full animate-spin" />
        <span className="text-[15px] text-[#615d59]">Loading session...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-[#f6f5f4] flex items-center justify-center">
        <div className="bg-white rounded-[16px] border border-[#e6e6e6] p-8 max-w-sm text-center shadow-[0_0.175px_1.041px_rgba(0,0,0,0.01),0_0.8px_2.925px_rgba(0,0,0,0.02),0_2.025px_7.847px_rgba(0,0,0,0.027),0_4px_18px_rgba(0,0,0,0.04)]">
          <h2 className="text-[22px] font-bold text-black mb-2">Error</h2>
          <p className="text-[15px] text-[#615d59] mb-6">{error}</p>
          <button
            onClick={() => router.push('/student-dashboard')}
            className="px-6 py-2 text-[15px] font-medium bg-[#0075de] text-white rounded-full hover:bg-[#005bab] transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-[#f6f5f4] dark:bg-[#0f0f0e] relative">
      {/* Full screen success overlay */}
      {diagnosisReached && (
        <div className="absolute inset-0 z-50 bg-white/95 dark:bg-[#0f0f0e]/95 flex flex-col items-center justify-center backdrop-blur-sm transition-all duration-700">
          <style>{`
            @keyframes successPop {
              0% { transform: scale(0.5); opacity: 0; }
              70% { transform: scale(1.1); opacity: 1; }
              100% { transform: scale(1); opacity: 1; }
            }
            .animate-success-pop {
              animation: successPop 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
          `}</style>
          
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 animate-success-pop mb-6">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="animate-success-pop" style={{ animationDelay: '0.2s', opacity: 0 }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-black dark:text-white mb-3 animate-success-pop" style={{ animationDelay: '0.3s', opacity: 0 }}>
            Diagnosis Confirmed!
          </h2>
          
          <p className="text-[16px] text-[#615d59] dark:text-[#8a8480] mb-8 max-w-sm text-center animate-success-pop" style={{ animationDelay: '0.4s', opacity: 0 }}>
            Excellent work! You successfully identified the correct diagnosis and completed the examination.
          </p>
          
          <button
            onClick={() => setIsSurveyOpen(true)}
            className="px-8 py-3.5 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-full hover:scale-105 active:scale-95 transition-transform animate-success-pop" style={{ animationDelay: '0.5s', opacity: 0 }}
          >
            Complete Survey
          </button>
        </div>
      )}

      {/* Failure Overlay */}
      {caseData?.status === 'FAILED' && !isSurveyOpen && (
        <div className="absolute inset-0 z-30 bg-white/90 dark:bg-[#1a1918]/90 backdrop-blur-md flex flex-col items-center justify-center p-6">
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6 shadow-xl animate-success-pop" style={{ animationDelay: '0.1s', opacity: 0 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-red-600 dark:text-red-400" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'draw-check 0.6s ease-out 0.3s forwards', strokeDasharray: 100, strokeDashoffset: 100 }}>
              <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-black dark:text-white mb-3 animate-success-pop" style={{ animationDelay: '0.3s', opacity: 0 }}>
            Time Expired
          </h2>
          
          <p className="text-[16px] text-[#615d59] dark:text-[#8a8480] mb-8 max-w-sm text-center animate-success-pop" style={{ animationDelay: '0.4s', opacity: 0 }}>
            You ran out of time before reaching a diagnosis. You can review your history below.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex-none h-[56px] flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-[#141312] border-b border-[#e6e6e6] dark:border-[#2e2c2a] z-10 relative">
        <div className="flex items-center w-[100px]">
          <button
            onClick={() => router.push('/student-dashboard')}
            className="p-1.5 -ml-1 text-[#a39e98] hover:text-black transition-colors rounded-[5px] hover:bg-[#f6f5f4] flex items-center justify-center"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
        </div>

        {/* Center title */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
          <h1 className="text-[17px] font-semibold text-black dark:text-[#f0ede9]">
            Patient Examination {caseData?.caseNumber ? `– Case ${caseData.caseNumber}` : ''}
          </h1>
        </div>

        {/* Header Right */}
        <div className="flex items-center justify-end w-1/3 pr-6 gap-3">
          {timeLeft !== null && !diagnosisReached && (
            <div className={`px-3 py-1.5 rounded-full flex items-center gap-2 ${
              timeLeft < 60000 
                ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 font-bold animate-pulse' 
                : 'bg-[#f6f5f4] text-[#615d59] dark:bg-[#2e2c2a] dark:text-[#a39e98] font-medium'
            }`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span className="text-[13px] tracking-wide font-mono tabular-nums">
                {String(Math.floor(timeLeft / 60000)).padStart(2, '0')}:{String(Math.floor((timeLeft % 60000) / 1000)).padStart(2, '0')}
              </span>
            </div>
          )}
          <button
            onClick={() => setIsVoiceEnabled(prev => !prev)}
            aria-label="Toggle patient voice"
            className="p-1.5 text-[#a39e98] hover:text-black dark:text-[#5a5652] dark:hover:text-[#f0ede9] transition-colors rounded-[5px] hover:bg-[#f6f5f4] dark:hover:bg-[#1a1918] flex items-center justify-center"
          >
            {isVoiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <ThemeToggle />
          <button
            onClick={() => setIsNotesOpen(prev => !prev)}
            aria-label="Toggle clinical notes"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-[8px] transition-all ${
              isNotesOpen
                ? 'bg-[#0075de]/10 text-[#0075de]'
                : 'text-[#615d59] hover:text-black hover:bg-[#f6f5f4] dark:text-[#8a8480] dark:hover:text-[#f0ede9] dark:hover:bg-[#1a1918]'
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span className="hidden sm:inline">Notes</span>
          </button>
        </div>
      </div>

      {/* Patient Intake Card — only rendered when case data is available */}
      {caseData && (
        <PatientIntakeCard
          patientName="Standardized Patient"
          age={0}
          gender=""
          chiefComplaint={caseData.presentingComplaint || 'See patient for details'}
          difficulty={(caseData.difficulty as 'Beginner' | 'Intermediate' | 'Advanced') || 'Intermediate'}
          caseNumber={caseData.caseNumber || 1}
          totalCases={4}
        />
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="flex flex-col h-full max-w-[680px] mx-auto px-4 sm:px-6 pt-6 pb-12 space-y-3">
          {messages.length === 0 && !isLoading ? (
            <div className="flex flex-col h-full items-center justify-center text-center py-12 flex-1">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a39e98" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"></path>
                <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"></path>
                <circle cx="20" cy="10" r="2"></circle>
              </svg>
              <h3 className="text-[17px] font-semibold text-black dark:text-white mt-4 mb-1.5">Begin the examination</h3>
              <p className="text-[15px] text-[#615d59] dark:text-[#8a8480] max-w-xs">Introduce yourself to your patient and start asking questions.</p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div key={msg.id || idx} className={`flex ${msg.sender === 'STUDENT' ? 'justify-end' : 'justify-start'}`}>
                  {/* Patient avatar — only on the first bubble or after a student message */}
                  {msg.sender === 'PATIENT' && (
                    <div className="flex-none w-7 h-7 rounded-full bg-[#2a9d99] text-white flex items-center justify-center text-[11px] font-semibold mr-2 mt-0.5 self-end">
                      {caseData?.title?.[0]?.toUpperCase() ?? 'P'}
                    </div>
                  )}
                  <div className="flex flex-col max-w-[75%]">
                    <div
                      className={
                        msg.sender === 'STUDENT'
                          ? `w-fit px-4 py-2.5 text-[15px] leading-[1.5] rounded-[18px] rounded-br-[4px] self-end whitespace-pre-wrap ${
                              msg.failed
                                ? 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400'
                                : 'bg-[#0075de] text-white'
                            }`
                          : 'w-fit px-4 py-2.5 text-[15px] leading-[1.5] bg-white dark:bg-[#242220] border border-[#e6e6e6] dark:border-[#323030] text-black dark:text-[#f0ede9] rounded-[18px] rounded-bl-[4px] shadow-[0_0.175px_1.041px_rgba(0,0,0,0.01),0_0.8px_2.925px_rgba(0,0,0,0.02)] self-start whitespace-pre-wrap'
                      }
                    >
                      {msg.text}
                    </div>
                    {msg.failed ? (
                      <div className="flex items-center gap-1.5 mt-0.5 px-1 justify-end">
                        <span className="text-[11px] text-red-400">Failed to send</span>
                        <button
                          onClick={() => handleRetry(msg)}
                          className="text-[11px] text-[#0075de] hover:underline"
                        >
                          Retry
                        </button>
                      </div>
                    ) : (
                      <span className={`text-[11px] text-[#a39e98] mt-0.5 px-1 ${msg.sender === 'STUDENT' ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start items-end gap-2">
                  <div className="flex-none w-7 h-7 rounded-full bg-[#2a9d99] text-white flex items-center justify-center text-[11px] font-semibold">
                    {caseData?.title?.[0]?.toUpperCase() ?? 'P'}
                  </div>
                  <div className="px-4 py-3 bg-white dark:bg-[#242220] border border-[#e6e6e6] dark:border-[#323030] rounded-[18px] rounded-bl-[4px] shadow-[0_0.175px_1.041px_rgba(0,0,0,0.01),0_0.8px_2.925px_rgba(0,0,0,0.02)] flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-[#a39e98] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-[#a39e98] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-[#a39e98] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} className="h-6 shrink-0" />
        </div>
      </div>
      
      {/* Input area */}
      <div className="flex-none w-full relative z-40">
        {caseData?.status === 'COMPLETED' ? (
          <div className="bg-[#f6f5f4] dark:bg-[#0f0f0e] border-t border-[#e6e6e6] dark:border-[#2e2c2a] px-4 sm:px-6 py-6 flex items-center justify-center">
             <p className="text-[14px] text-[#a39e98] dark:text-[#5a5652] font-medium flex items-center gap-2">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
               This case is completed. History is read-only.
             </p>
          </div>
        ) : (
          <>
            {sendError && (
              <div className="max-w-[680px] mx-auto px-4 sm:px-6 pb-2">
                <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-[8px] text-[13px] text-red-600 flex items-center justify-between">
                  <span>{sendError}</span>
                  <button
                    onClick={() => setSendError(null)}
                    className="text-red-400 hover:text-red-600 ml-2"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
            <div className="bg-white dark:bg-[#141312] border-t border-[#e6e6e6] dark:border-[#2e2c2a] px-4 sm:px-6 py-3">
              <form onSubmit={handleSend} className="max-w-[680px] mx-auto flex items-end gap-3 relative">
                <DynamicVoiceIsland onTranscription={sendMessage} isPatientTalking={isPatientTalking} />
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={diagnosisReached ? 'Examination complete' : 'Ask a question… (Enter to send, Shift+Enter for new line)'}
                  disabled={isTyping || diagnosisReached}
                  rows={1}
                  className="flex-1 bg-[#f6f5f4] dark:bg-[#1a1918] border border-[#e6e6e6] dark:border-[#2e2c2a] rounded-[12px] px-4 py-2.5 text-[15px] text-black dark:text-[#f0ede9] placeholder-[#a39e98] dark:placeholder-[#5a5652] focus:outline-none focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none overflow-hidden leading-[1.5]"
                  style={{ maxHeight: '120px', overflowY: inputValue.split('\n').length > 3 ? 'auto' : 'hidden' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                  }}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="flex-none w-9 h-9 mb-[2px] flex items-center justify-center bg-[#0075de] text-white rounded-full hover:bg-[#005bab] disabled:bg-[#e6e6e6] disabled:text-[#a39e98] dark:disabled:bg-[#2e2c2a] dark:disabled:text-[#5a5652] disabled:cursor-not-allowed active:scale-[0.95] transition-all"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5"></line>
                    <polyline points="5 12 12 5 19 12"></polyline>
                  </svg>
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* Notes Panel (slides in from right) */}
      <NotesPanel
        isOpen={isNotesOpen}
        onToggle={() => setIsNotesOpen(prev => !prev)}
        sessionId={sessionId}
      />

      {/* Post-Diagnosis Survey Modal */}
      <PostDiagnosisSurvey
        isOpen={isSurveyOpen}
        onClose={() => setIsSurveyOpen(false)}
        onSubmit={handleSurveySubmit}
        sessionId={sessionId}
      />
    </div>
  );
}