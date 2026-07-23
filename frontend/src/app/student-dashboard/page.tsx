'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type CaseStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

interface Case {
  caseId: string;
  title: string;
  category: string;
  difficultyLevel: string;
  status: CaseStatus;
  sessionId: string | null;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [participantId, setParticipantId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [startingCaseId, setStartingCaseId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('participant_id');
    const token = localStorage.getItem('jwt_token');

    if (!id || !token) {
      router.push('/');
      return;
    }

    setParticipantId(id);

    const fetchCases = async () => {
      try {
        const res = await fetch('/marta/api/v1/cases', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch cases');
        }

        const data = await res.json();
        setCases(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('participant_id');
    localStorage.removeItem('jwt_token');
    router.push('/');
  };

  const handleOpenCase = async (c: Case) => {
    if (c.sessionId) {
      router.push(`/chat/${c.sessionId}`);
      return;
    }

    setStartingCaseId(c.caseId);
    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch('/marta/api/v1/chat/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ caseId: c.caseId }),
      });

      if (!res.ok) {
        throw new Error('Failed to start case');
      }

      const data = await res.json();
      router.push(`/chat/${data.id}`);
    } catch (err: any) {
      console.error(err);
      alert('Error starting case');
      setStartingCaseId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center flex-col gap-4">
        <div className="w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-zinc-800">
      <header className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur border-b border-zinc-800/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tracking-tight text-white">MARTA</span>
          <div className="px-2 py-1 bg-zinc-900 border border-zinc-700 rounded-md">
            <span className="font-mono text-xs text-zinc-400">ID: {participantId}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-zinc-400 hover:text-red-400 transition-colors duration-150"
        >
          Logout
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Your Cases</h2>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {cases.length === 0 && !error ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center border border-dashed border-zinc-800 rounded-xl">
            <svg
              className="w-12 h-12 text-zinc-700 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-zinc-500 text-sm">No cases available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cases.map((c) => {
              const isStarting = startingCaseId === c.caseId;
              
              let statusBadgeClass = '';
              let buttonClass = '';
              let buttonText = '';

              if (c.status === 'NOT_STARTED') {
                statusBadgeClass = 'bg-zinc-700/50 text-zinc-300 border border-zinc-600/50';
                buttonClass = 'bg-zinc-800 text-white hover:bg-white hover:text-black';
                buttonText = 'Start Case';
              } else if (c.status === 'IN_PROGRESS') {
                statusBadgeClass = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                buttonClass = 'bg-blue-600 text-white hover:bg-blue-700';
                buttonText = 'Resume';
              } else {
                statusBadgeClass = 'bg-green-500/10 text-green-400 border border-green-500/20';
                buttonClass = 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300';
                buttonText = 'View History';
              }

              return (
                <div
                  key={c.caseId}
                  className="group flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 hover:bg-zinc-800/50 transition-all duration-150"
                >
                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-xs font-medium">
                          {c.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-xs font-medium">
                          {c.difficultyLevel}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase ${statusBadgeClass}`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 leading-snug">
                      {c.title}
                    </h3>
                  </div>
                  <div className="p-2 pt-0 mt-auto">
                    <button
                      onClick={() => handleOpenCase(c)}
                      disabled={isStarting}
                      className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 flex items-center justify-center gap-2 ${buttonClass} ${isStarting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isStarting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span>Starting...</span>
                        </>
                      ) : (
                        buttonText
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
