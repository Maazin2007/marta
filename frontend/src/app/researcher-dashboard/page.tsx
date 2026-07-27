'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Participant {
  id: string;
  participantId: string;
  createdAt: string;
}

interface KnowledgeCase {
  id: string;
  title: string;
  category: string;
}

export default function ResearcherDashboard() {
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [token, setToken] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Upload state
  const [cases, setCases] = useState<KnowledgeCase[]>([]);
  const [casesLoading, setCasesLoading] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [category, setCategory] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('researcher_token');
    if (!savedToken) {
      router.push('/');
      return;
    }
    setToken(savedToken);

    const fetchParticipants = async () => {
      try {
        const res = await fetch('/marta/api/v1/auth/researcher/participants', {
          headers: { Authorization: `Bearer ${savedToken}` }
        });
        if (!res.ok) throw new Error('Failed to fetch participants');
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          setParticipants(data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load participants');
      } finally {
        setLoading(false);
      }
    };

    const fetchCases = async () => {
      setCasesLoading(true);
      try {
        const res = await fetch('/marta/api/v1/admin/knowledge/cases', {
          headers: { Authorization: `Bearer ${savedToken}` }
        });
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType?.includes('application/json')) {
          const data = await res.json();
          setCases(data);
        }
      } catch {
        // silently fail — cases are optional
      } finally {
        setCasesLoading(false);
      }
    };

    fetchParticipants();
    fetchCases();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('researcher_token');
    router.push('/');
  };

  const handleDelete = async (participantId: string) => {
    if (!token) return;
    setDeletingId(participantId);
    setConfirmDeleteId(null);
    try {
      const res = await fetch(`/marta/api/v1/auth/researcher/participants/${participantId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok || res.status === 204) {
        setParticipants(prev => prev.filter(p => p.participantId !== participantId));
      } else {
        setError('Failed to delete participant.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !category || !token) return;
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (selectedCaseId) formData.append('caseId', selectedCaseId);
      formData.append('category', category);
      
      const res = await fetch('/marta/api/v1/admin/knowledge/ingest', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      
      if (!res.ok) {
        const contentType = res.headers.get('content-type');
        const errData = contentType?.includes('application/json') ? await res.json() : null;
        throw new Error(errData?.message || `Upload failed (${res.status})`);
      }
      
      const text = await res.text();
      setSuccessMessage(text || 'PDF uploaded successfully.');
      setUploadSuccess(true);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setSelectedCaseId('');
    setCategory('');
    setSelectedFile(null);
    setUploadError(null);
    setUploadSuccess(false);
    setSuccessMessage('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f5f4] flex flex-col items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#e6e6e6] border-t-[#0075de] rounded-full animate-spin"></div>
        <p className="text-[15px] text-[#615d59] mt-3">Loading...</p>
      </div>
    );
  }

  const filteredParticipants = participants.filter(p => 
    p.participantId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f6f5f4]">
      {/* Nav bar */}
      <nav className="sticky top-0 z-10 bg-white border-b border-[#e6e6e6] px-6 h-[56px] flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-[15px] font-semibold text-black">MARTA</span>
          <span className="ml-2 px-2 py-0.5 bg-[#f6f5f4] border border-[#e6e6e6] rounded-full text-[11px] font-semibold text-[#615d59] tracking-[0.125px] uppercase">
            Researcher
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="bg-white border border-[#e6e6e6] rounded-full px-4 py-1.5 text-[13px] font-medium text-[#615d59] hover:bg-[#f6f5f4] hover:text-black transition-colors"
        >
          Logout
        </button>
      </nav>

      {/* Main content area */}
      <main className="max-w-[1080px] mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-[40px] font-bold leading-[1.1] tracking-[-1px] text-black mb-8">
          Dashboard
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column (Stats & Participants) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stats Box */}
            <div className="bg-white rounded-[12px] border border-[#e6e6e6] p-5 shadow-[0_0.175px_1.041px_rgba(0,0,0,0.01),0_0.8px_2.925px_rgba(0,0,0,0.02)]">
              <p className="text-[12px] font-semibold tracking-[0.125px] uppercase text-[#a39e98] mb-1">
                Total Participants
              </p>
              <p className="text-[32px] font-bold tracking-[-0.5px] text-black leading-none">
                {participants.length}
              </p>
            </div>

            {error && (
              <div className="bg-white border border-red-200 rounded-[12px] p-5 text-[15px] text-red-600">
                {error}
              </div>
            )}

            {/* Participants Table */}
            <div className="bg-white rounded-[12px] border border-[#e6e6e6] overflow-hidden shadow-[0_0.175px_1.041px_rgba(0,0,0,0.01),0_0.8px_2.925px_rgba(0,0,0,0.02)]">
              <div className="px-5 py-4 border-b border-[#e6e6e6] bg-[#f6f5f4]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-[16px] font-semibold text-black">Active Participants</h2>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search ID..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-[240px] bg-white border border-[#e6e6e6] rounded-full pl-9 pr-4 py-1.5 text-[13px] text-black placeholder-[#a39e98] focus:outline-none focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de]/20 transition-all"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#a39e98]">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </svg>
                </div>
              </div>
              
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#f6f5f4] border-b border-[#e6e6e6]">
                    <th className="px-5 py-3 text-left text-[12px] font-semibold tracking-[0.125px] uppercase text-[#a39e98]">
                      Participant ID
                    </th>
                    <th className="px-5 py-3 text-left text-[12px] font-semibold tracking-[0.125px] uppercase text-[#a39e98]">
                      Registered
                    </th>
                    <th className="px-5 py-3 text-right text-[12px] font-semibold tracking-[0.125px] uppercase text-[#a39e98]">
                      Actions
                    </th>
                  </tr>
                </thead>
                {filteredParticipants.length > 0 ? (
                  <tbody>
                    {filteredParticipants.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-[#e6e6e6] last:border-0 hover:bg-[#f6f5f4] transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-[14px] text-black">{p.participantId}</span>
                        </td>
                        <td className="px-5 py-3.5 text-[15px] text-[#615d59]">
                          {formatDate(p.createdAt)}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {deletingId === p.participantId ? (
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-3.5 h-3.5 border-2 border-[#e6e6e6] border-t-[#615d59] rounded-full animate-spin"></div>
                              <span className="text-[13px] text-[#a39e98]">Deleting...</span>
                            </div>
                          ) : confirmDeleteId === p.participantId ? (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-[13px] text-[#615d59]">Are you sure?</span>
                              <button
                                onClick={() => handleDelete(p.participantId)}
                                className="px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-full text-[12px] font-semibold hover:bg-red-100 transition-colors"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-3 py-1 bg-white border border-[#e6e6e6] rounded-full text-[12px] font-medium text-[#615d59] hover:bg-[#f6f5f4] transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(p.participantId)}
                              className="px-4 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-full text-[13px] font-medium hover:bg-red-100 transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ) : null}
              </table>

              {participants.length > 0 && filteredParticipants.length === 0 && (
                <div className="p-10 text-center text-[#615d59] text-[14px]">
                  No participants matching "{searchQuery}"
                </div>
              )}

              {participants.length === 0 && (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-[#a39e98]">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <h3 className="text-[16px] font-semibold text-black mt-4 mb-1">
                    No participants yet
                  </h3>
                  <p className="text-[14px] text-[#615d59]">
                    Invite students to start tracking progress.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Upload PDF) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[12px] border border-[#e6e6e6] shadow-[0_0.175px_1.041px_rgba(0,0,0,0.01),0_0.8px_2.925px_rgba(0,0,0,0.02)]">
              <div className="px-5 py-4 border-b border-[#e6e6e6] bg-[#f6f5f4]/50">
                <p className="text-[12px] font-semibold tracking-[0.125px] text-[#a39e98] uppercase mb-0.5">Knowledge Base</p>
                <h2 className="text-[18px] font-bold text-black">Upload PDF</h2>
              </div>

              <div className="p-5">
                {uploadSuccess ? (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-green-600">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </div>
                    <h3 className="text-[16px] font-bold text-black mb-1">Upload Successful</h3>
                    <p className="text-[14px] text-[#615d59] mb-5">{successMessage}</p>
                    <button onClick={resetUpload} className="bg-white border border-[#e6e6e6] text-black rounded-full px-5 py-2 text-[14px] font-medium hover:bg-[#f6f5f4] transition-all w-full">
                      Upload Another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleUploadSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="case-select" className="block text-[13px] font-medium text-[#31302e] mb-1">
                        Case (optional)
                      </label>
                      <p className="text-[12px] text-[#a39e98] mb-1.5">Leave empty for universal textbook content</p>
                      <div className="relative">
                        <select
                          id="case-select"
                          value={selectedCaseId}
                          onChange={(e) => setSelectedCaseId(e.target.value)}
                          className="w-full bg-white border border-[#e6e6e6] rounded-[6px] px-3 py-2 text-[14px] text-black placeholder-[#a39e98] focus:outline-none focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de]/20 transition-all appearance-none"
                        >
                          <option value="">All cases (universal)</option>
                          {casesLoading ? (
                            <option disabled>Loading cases...</option>
                          ) : (
                            cases.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.title}
                              </option>
                            ))
                          )}
                        </select>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#a39e98]">
                          <path d="m6 9 6 6 6-6"/>
                        </svg>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="category-select" className="block text-[13px] font-medium text-[#31302e] mb-1">
                        Category
                      </label>
                      <div className="relative">
                        <select
                          id="category-select"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          required
                          className="w-full bg-white border border-[#e6e6e6] rounded-[6px] px-3 py-2 text-[14px] text-black placeholder-[#a39e98] focus:outline-none focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de]/20 transition-all appearance-none"
                        >
                          <option value="">Select category</option>
                          <option value="textbook">Textbook</option>
                          <option value="guidelines">Clinical Guidelines</option>
                          <option value="reference">Reference Material</option>
                        </select>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#a39e98]">
                          <path d="m6 9 6 6 6-6"/>
                        </svg>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium text-[#31302e] mb-1">
                        PDF File
                      </label>
                      <label
                        htmlFor="pdf-file-input"
                        className={`block w-full border-2 border-dashed rounded-[8px] p-5 text-center cursor-pointer transition-all ${
                          selectedFile
                            ? 'border-[#0075de] bg-[#0075de]/5'
                            : 'border-[#e6e6e6] hover:border-[#0075de]/40 hover:bg-[#f6f5f4]'
                        }`}
                      >
                        {selectedFile ? (
                          <div>
                            <p className="text-[13px] font-semibold text-[#0075de] break-all">{selectedFile.name}</p>
                            <p className="text-[12px] text-[#615d59] mt-0.5">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        ) : (
                          <div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-[#a39e98]">
                              <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                              <path d="M12 12v9" />
                              <path d="m16 16-4-4-4 4" />
                            </svg>
                            <p className="text-[13px] text-[#615d59] mt-2">Click to select a PDF</p>
                          </div>
                        )}
                      </label>
                      <input
                        id="pdf-file-input"
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="sr-only"
                      />
                    </div>

                    {uploadError && (
                      <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-[6px] text-[13px] text-red-600">
                        {uploadError}
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={uploading || !selectedFile || !category}
                        className="w-full bg-[#0075de] text-white rounded-full px-5 py-2 text-[14px] font-medium hover:bg-[#005bab] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploading ? 'Uploading...' : 'Upload PDF'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
