'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Message {
  id: string;
  sender: 'STUDENT' | 'PATIENT';
  text: string;
  sentAt: string;
}

export default function ChatPage() {
  const { id: sessionId } = useParams() as { id: string };
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      router.push('/');
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/marta/api/v1/chat/${sessionId}/messages`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Failed to fetch messages', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [sessionId, router]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const token = localStorage.getItem('jwt_token');
    if (!token) {
      router.push('/');
      return;
    }

    const messageText = inputValue.trim();
    setInputValue('');
    setIsTyping(true);

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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: messageText })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data]);
      } else {
        console.error('Failed to send message');
        // Handle failure if needed, for instance, remove the optimistic message
      }
    } catch (error) {
      console.error('Error sending message', error);
    } finally {
      setIsTyping(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="animate-pulse flex space-x-2">
          <div className="w-2 h-2 bg-zinc-500 rounded-full"></div>
          <div className="w-2 h-2 bg-zinc-500 rounded-full"></div>
          <div className="w-2 h-2 bg-zinc-500 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0a0a0a] text-zinc-100 font-sans">
      {/* Header */}
      <header className="flex-none h-16 flex items-center justify-between px-4 sm:px-6 bg-zinc-950/90 backdrop-blur border-b border-zinc-800/60 z-10">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => router.push('/student-dashboard')}
            className="text-zinc-600 hover:text-zinc-300 transition-colors p-1.5 -ml-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-800"
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <h1 className="text-white font-semibold text-lg tracking-tight">Patient Examination</h1>
        </div>
        <button 
          onClick={() => alert('Diagnosis flow coming soon!')}
          className="px-4 py-1.5 text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded-md hover:bg-red-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
        >
          Submit Diagnosis
        </button>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-zinc-500 text-sm">Introduce yourself to your patient to begin.</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto w-full pb-4">
            {messages.map((msg) => {
              const isStudent = msg.sender === 'STUDENT';
              return (
                <div key={msg.id} className={`flex ${isStudent ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[75%] px-4 py-2.5 text-[15px] leading-relaxed shadow-sm ${
                      isStudent 
                        ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm' 
                        : 'bg-zinc-800 border border-zinc-700/50 text-zinc-100 rounded-2xl rounded-bl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="px-4 py-3.5 bg-zinc-800 border border-zinc-700/50 rounded-2xl rounded-bl-sm flex items-center space-x-1.5 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} className="h-1" />
          </div>
        )}
      </main>

      {/* Input */}
      <footer className="flex-none p-4 pb-6 sm:pb-8 bg-zinc-950/90 backdrop-blur border-t border-zinc-800/60 z-10">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isTyping}
            placeholder="Message your patient..."
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-full pl-5 pr-12 py-3.5 text-[15px] text-zinc-100 placeholder-zinc-500 disabled:opacity-50 transition-all shadow-sm"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="absolute right-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 disabled:bg-transparent disabled:text-zinc-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900 flex items-center justify-center"
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 12 7-7 7 7"/>
              <path d="M12 19V5"/>
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
}