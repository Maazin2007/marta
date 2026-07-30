'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

interface Case {
  caseId: string;
  title: string;
  difficulty: string;
  difficultyLevel?: string;
  category: string;
  presentingComplaint?: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'PENDING_FEEDBACK' | 'COMPLETED' | 'FAILED';
  sessionId?: string;
  startedAt?: string;
}

const BAND_COLORS = ['#62aef0', '#d6b6f6', '#2a9d99', '#dd5b00'];

export default function StudentDashboard() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participantId, setParticipantId] = useState<string>('');
  const [startingCaseId, setStartingCaseId] = useState<string | null>(null);
  const [warningCase, setWarningCase] = useState<Case | null>(null);

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
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          console.error('Failed to fetch cases:', res.status, res.statusText);
          throw new Error('FETCH_FAILED');
        }

        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          setCases(data);
        } else {
          console.error('Unexpected response format from /cases');
          throw new Error('FETCH_FAILED');
        }
      } catch (err: unknown) {
        console.error('fetchCases error:', err);
        setError('We couldn\'t load your cases right now. Please refresh the page or try again in a moment.');
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

  const handleOpenCase = async (c: Case, index: number) => {
    if (c.status === 'COMPLETED' && !c.sessionId) return;
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      router.push('/');
      return;
    }

    if (c.sessionId) {
      // Stash case data so the chat page can show the patient intake card without an extra fetch
      sessionStorage.setItem(`marta_case_${c.sessionId}`, JSON.stringify({ ...c, caseNumber: index + 1 }));
      router.push(`/chat/${c.sessionId}`);
      return;
    }

    setStartingCaseId(c.caseId);
    try {
      const res = await fetch('/marta/api/v1/chat/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ caseId: c.caseId })
      });

      if (!res.ok) {
        console.error('Failed to start case:', res.status);
        throw new Error('START_FAILED');
      }

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        // Stash the case data under the new session id
        sessionStorage.setItem(`marta_case_${data.id}`, JSON.stringify({ ...c, sessionId: data.id, caseNumber: index + 1, startedAt: data.startedAt || c.startedAt }));
        router.push(`/chat/${data.id}`);
      } else {
        console.error('Unexpected response format from /chat/start');
        throw new Error('START_FAILED');
      }
    } catch (err: unknown) {
      console.error('Error starting case:', err);
      setError('Something went wrong opening this case. Please try again.');
      setStartingCaseId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f5f4] dark:bg-[#0f0f0e] flex flex-col items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#e6e6e6] dark:border-[#2e2c2a] border-t-[#0075de] rounded-full animate-spin"></div>
        <span className="text-[15px] text-[#615d59] dark:text-[#8a8480] mt-3">Loading dashboard...</span>
      </div>
    );
  }

  const completedCount = cases.filter(c => c.status === 'COMPLETED' || c.status === 'FAILED').length;
  const totalCount = cases.length || 4;
  const progressPercent = (completedCount / totalCount) * 100;

  return (
    <div className="h-screen overflow-hidden bg-[#f6f5f4] dark:bg-[#0f0f0e] flex flex-col">
      <nav className="shrink-0 bg-white dark:bg-[#141312] border-b border-[#e6e6e6] dark:border-[#2e2c2a] px-6 h-[52px] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <path d="M32 4C23.6 4 16 10.4 16 19.2c0 4 1.2 7.6 2.8 10.4L22 52c.4 2 2 3.6 4 3.6h12c2 0 3.6-1.6 4-3.6l3.2-22.4c1.6-2.8 2.8-6.4 2.8-10.4C48 10.4 40.4 4 32 4z" fill="#0075de"/>
          </svg>
          <span className="text-[15px] font-bold tracking-[-0.3px] text-black dark:text-[#f0ede9]">MARTA</span>
          <span className="text-[11px] font-semibold text-[#a39e98] dark:text-[#5a5652] uppercase tracking-[0.08em]">Research</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="w-px h-4 bg-[#e6e6e6] dark:bg-[#2e2c2a]" />
          <button onClick={handleLogout} className="text-[13px] font-medium text-[#615d59] dark:text-[#8a8480] hover:text-black dark:hover:text-[#f0ede9] transition-colors">
            Sign out
          </button>
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto">
        <main className="max-w-[1080px] mx-auto px-6 pt-8 pb-10">
          <div className="mb-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a39e98] dark:text-[#5a5652] mb-1">Welcome back</p>
            <h1 className="text-[44px] font-black text-black dark:text-white leading-[1] tracking-[-2px] font-mono">
              {participantId}
            </h1>
            <p className="text-[14px] text-[#615d59] dark:text-[#8a8480] mt-2">
              Complete all 4 patient examinations to finish the study.
            </p>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[14px] font-medium text-[#615d59] dark:text-[#8a8480]">
                {completedCount} of {totalCount} complete
              </span>
              <span className="text-[14px] font-medium text-black dark:text-[#f0ede9]">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-[#e6e6e6] dark:bg-[#2e2c2a] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#1aae39] transition-all duration-700 ease-out rounded-full" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {error && (
            <div className="bg-white dark:bg-[#1a1918] border border-red-200 dark:border-red-900/50 rounded-[12px] p-5 text-[15px] text-red-600 dark:text-red-400 mb-6">
              {error}
            </div>
          )}

          {cases.length === 0 && !error ? (
            <div className="bg-white dark:bg-[#1a1918] rounded-[12px] border border-[#e6e6e6] dark:border-[#2e2c2a] p-16 flex flex-col items-center justify-center text-center">
              <svg className="w-12 h-12 text-[#a39e98] dark:text-[#615d59]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-[17px] font-semibold text-black dark:text-[#f0ede9] mt-4 mb-1">No cases available</h3>
              <p className="text-[15px] text-[#615d59] dark:text-[#8a8480]">Check back later for new assignments.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {cases.map((c, index) => {
                const isStarting = startingCaseId === c.caseId;
                const bandColor = BAND_COLORS[index % BAND_COLORS.length];
                const caseNum = String(index + 1).padStart(2, '0');
                const isCompleted = c.status === 'COMPLETED';
                const isFailed = c.status === 'FAILED';
                const isInProgress = c.status === 'IN_PROGRESS';
                const isPending = c.status === 'PENDING_FEEDBACK';

                return (
                  <div
                    key={c.caseId}
                    onClick={() => !isStarting && handleOpenCase(c, index)}
                    className={`group relative bg-white dark:bg-[#242220] rounded-[16px] border border-[#e6e6e6] dark:border-[#323030] flex flex-col overflow-hidden transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-[0_4px_6px_rgba(0,0,0,0.04),0_12px_36px_rgba(0,0,0,0.09)] dark:hover:shadow-[0_4px_6px_rgba(0,0,0,0.3),0_12px_36px_rgba(0,0,0,0.4)] ${isCompleted ? 'opacity-80' : ''} ${isStarting ? 'pointer-events-none' : ''}`}
                  >
                    {/* Hero band */}
                    <div className="h-36 w-full relative shrink-0 overflow-hidden" style={{ backgroundColor: bandColor }}>
                      {/* Gradient overlay */}
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.28) 100%)' }} />
                      {/* Ghosted tooth icon */}
                      <svg className="absolute -right-3 -top-3 opacity-[0.12]" width="130" height="130" viewBox="0 0 64 64" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M32 4C23.6 4 16 10.4 16 19.2c0 4 1.2 7.6 2.8 10.4L22 52c.4 2 2 3.6 4 3.6h12c2 0 3.6-1.6 4-3.6l3.2-22.4c1.6-2.8 2.8-6.4 2.8-10.4C48 10.4 40.4 4 32 4z"/>
                      </svg>
                      {/* Status badge */}
                      {(isCompleted || isFailed || isPending) && (
                        <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[12px] font-bold tracking-wide flex items-center gap-1.5 shrink-0 ${
                          c.status === 'COMPLETED'
                            ? 'bg-[#e5f5e8] text-[#127a37] dark:bg-[#127a37]/20 dark:text-[#4ade80]'
                            : c.status === 'FAILED'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : c.status === 'PENDING_FEEDBACK'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-[#f6f5f4] text-[#615d59] dark:bg-[#2e2c2a] dark:text-[#a39e98]'
                        }`}>
                          {c.status === 'COMPLETED' && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          )}
                          {c.status === 'FAILED' && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          )}
                          {c.status === 'PENDING_FEEDBACK' && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                          )}
                          {c.status === 'COMPLETED' ? 'COMPLETED' : c.status === 'FAILED' ? 'FAILED' : c.status === 'PENDING_FEEDBACK' ? 'ACTION REQUIRED' : c.status.replace('_', ' ')}
                        </div>
                      )}
                      {/* In-progress pulse */}
                      {isInProgress && (
                        <div className="absolute top-4 right-4 flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                          <span className="text-white/80 text-[11px] font-semibold uppercase tracking-wide">Active</span>
                        </div>
                      )}
                      {/* Case number overlay */}
                      <div className="absolute bottom-0 left-0 p-4">
                        <p className="text-white/60 text-[11px] font-semibold uppercase tracking-[0.1em] leading-none mb-1">
                          {c.category || 'Operative Dentistry'}
                        </p>
                        <p className="text-white text-[34px] font-bold leading-none tracking-[-1.5px]">
                          Case {caseNum}
                        </p>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-5 flex flex-col flex-1">
                      {/* Difficulty + status row */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[12px] font-medium text-[#a39e98] dark:text-[#5a5652]">
                          {c.difficultyLevel || c.difficulty || 'Standard'}
                        </span>
                        {c.status === 'NOT_STARTED' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#f6f5f4] dark:bg-[#2e2c2a] text-[#615d59] dark:text-[#a39e98] border border-[#e6e6e6] dark:border-[#4d4a47]">
                            Not started
                          </span>
                        )}
                        {isInProgress && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#0075de]/10 dark:bg-[#0075de]/20 text-[#0075de] dark:text-[#62aef0] border border-[#0075de]/20 dark:border-[#0075de]/30">
                            In progress
                          </span>
                        )}
                        {isPending && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                            Survey Required
                          </span>
                        )}
                        {isCompleted && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50">
                            Completed
                          </span>
                        )}
                        {isFailed && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                            Failed (Time Up)
                          </span>
                        )}
                      </div>

                      {/* Chief complaint quote block */}
                      {c.presentingComplaint ? (
                        <div className="flex-1 border-l-[3px] pl-3 mb-5" style={{ borderColor: bandColor }}>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#a39e98] dark:text-[#5a5652] mb-1">Chief complaint</p>
                          <p className="text-[14px] text-[#31302e] dark:text-[#c9c4be] leading-snug line-clamp-3">
                            {c.presentingComplaint}
                          </p>
                        </div>
                      ) : (
                        <div className="flex-1 mb-5">
                          <p className="text-[14px] text-[#a39e98] dark:text-[#5a5652] italic">
                            Begin the examination to learn more.
                          </p>
                        </div>
                      )}

                      {(isCompleted || isFailed) && (
                        <button
                          disabled={isStarting}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCase(c);
                          }}
                          className="w-full bg-[#f6f5f4] dark:bg-[#2e2c2a] text-[#615d59] dark:text-[#a39e98] rounded-[10px] px-5 py-2.5 text-[14px] font-semibold border border-[#e6e6e6] dark:border-[#4d4a47] hover:bg-[#ebe9e8] dark:hover:bg-[#383532] transition-colors flex justify-center items-center gap-2"
                        >
                          View History
                        </button>
                      )}
                      {!isCompleted && !isFailed && !isPending && (
                        <button
                          disabled={isStarting}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isInProgress) {
                              handleOpenCase(c);
                            } else {
                              setWarningCase(c);
                            }
                          }}
                          className={`w-full ${isInProgress ? 'bg-[#1aae39] dark:bg-[#158f2f] hover:bg-[#158f2f] dark:hover:bg-[#127a27]' : 'bg-[#0075de] hover:bg-[#005bab]'} text-white rounded-[10px] px-5 py-2.5 text-[14px] font-semibold active:scale-[0.98] transition-all flex justify-center items-center gap-2 ${isStarting ? 'opacity-70 cursor-not-allowed' : 'group-hover:gap-3'}`}
                        >
                          {isStarting ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Opening...</>
                          ) : (
                            <>{isInProgress ? 'Continue Examination' : 'Begin Examination'} <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>
                          )}
                        </button>
                      )}
                      {isPending && (
                        <button
                          disabled={isStarting}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCase(c);
                          }}
                          className={`w-full bg-amber-500 text-white rounded-[10px] px-5 py-2.5 text-[14px] font-semibold hover:bg-amber-600 active:scale-[0.98] transition-all flex justify-center items-center gap-2 ${isStarting ? 'opacity-70 cursor-not-allowed' : 'group-hover:gap-3'}`}
                        >
                          {isStarting ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Loading...</>
                          ) : (
                            <>Complete Survey <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg></>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Warning Modal */}
      {warningCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1a1918] rounded-[16px] p-6 sm:p-8 max-w-md w-full shadow-2xl animate-fade-in-up">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-5 mx-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <h2 className="text-[20px] font-bold text-center text-black dark:text-white mb-2">
              Ready to begin?
            </h2>
            <p className="text-[14.5px] text-[#615d59] dark:text-[#a39e98] text-center mb-6 leading-[1.6]">
              Once you start this examination, you will have exactly <strong>10 minutes</strong> to reach a diagnosis. The timer is enforced by the server and <strong>cannot be paused</strong>.
              <br/><br/>
              Do not refresh the page or leave the chat room, or you will lose your data and the clock will expire.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setWarningCase(null)}
                className="flex-1 py-3 rounded-[10px] font-semibold text-[#615d59] dark:text-[#a39e98] bg-[#f6f5f4] dark:bg-[#2e2c2a] hover:bg-[#ebe9e8] dark:hover:bg-[#383532] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleOpenCase(warningCase);
                  setWarningCase(null);
                }}
                className="flex-1 py-3 rounded-[10px] font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                I understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
