'use client';

import React, { useState, useEffect } from 'react';

interface PdfUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
}

interface KnowledgeCase {
  id: string;
  title: string;
  category: string;
}

export default function PdfUploadModal({ isOpen, onClose, token }: PdfUploadModalProps) {
  const [cases, setCases] = useState<KnowledgeCase[]>([]);
  const [casesLoading, setCasesLoading] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [category, setCategory] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const fetchCases = async () => {
      setCasesLoading(true);
      try {
        const res = await fetch('/marta/api/v1/admin/knowledge/cases', {
          headers: { Authorization: `Bearer ${token}` }
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
    fetchCases();
  }, [isOpen, token]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedCaseId('');
      setCategory('');
      setSelectedFile(null);
      setError(null);
      setUploadSuccess(false);
      setSuccessMessage('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !category) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (selectedCaseId) formData.append('caseId', selectedCaseId);
      formData.append('category', category);
      
      const res = await fetch('/marta/api/v1/admin/knowledge/ingest', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        // DO NOT set Content-Type — browser sets it automatically for FormData with boundary
        body: formData
      });
      
      if (!res.ok) {
        const contentType = res.headers.get('content-type');
        const errData = contentType?.includes('application/json') ? await res.json() : null;
        throw new Error(errData?.message || `Upload failed (${res.status})`);
      }
      
      // Response is plain text: "Successfully ingested N chunks from filename.pdf"
      const text = await res.text();
      setSuccessMessage(text || 'PDF uploaded successfully.');
      setUploadSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      
      {/* Modal card */}
      <div className="relative w-full max-w-[480px] bg-white rounded-[16px] border border-[#e6e6e6] shadow-[0_0.175px_1.041px_rgba(0,0,0,0.01),0_0.8px_2.925px_rgba(0,0,0,0.02),0_2.025px_7.847px_rgba(0,0,0,0.027),0_4px_18px_rgba(0,0,0,0.04)] p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[12px] font-semibold tracking-[0.125px] text-[#a39e98] uppercase mb-0.5">Knowledge Base</p>
            <h2 className="text-[22px] font-bold leading-[1.27] tracking-[-0.25px] text-black">Upload PDF</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#a39e98] hover:text-black transition-colors rounded-[5px] hover:bg-[#f6f5f4]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {uploadSuccess ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-green-600">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h3 className="text-[18px] font-bold text-black mb-1">Upload Successful</h3>
            <p className="text-[15px] text-[#615d59] mb-6">{successMessage}</p>
            <button onClick={onClose} className="bg-[#0075de] text-white rounded-full px-5 py-2.5 text-[16px] font-medium hover:bg-[#005bab] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="case-select" className="block text-[14px] font-medium text-[#31302e] mb-1">
                Case (optional)
              </label>
              <p className="text-[12px] text-[#a39e98] mb-1.5">Leave empty for universal textbook content</p>
              <div className="relative">
                <select
                  id="case-select"
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="w-full bg-white border border-[#e6e6e6] rounded-[4px] px-3 py-1.5 text-[15px] text-black placeholder-[#a39e98] focus:outline-none focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de]/20 transition-all appearance-none"
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
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#a39e98]">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </div>

            <div>
              <label htmlFor="category-select" className="block text-[14px] font-medium text-[#31302e] mb-1">
                Category
              </label>
              <div className="relative">
                <select
                  id="category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full bg-white border border-[#e6e6e6] rounded-[4px] px-3 py-1.5 text-[15px] text-black placeholder-[#a39e98] focus:outline-none focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de]/20 transition-all appearance-none"
                >
                  <option value="">Select category</option>
                  <option value="textbook">Textbook</option>
                  <option value="guidelines">Clinical Guidelines</option>
                  <option value="reference">Reference Material</option>
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#a39e98]">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#31302e] mb-1">
                PDF File
              </label>
              <label
                htmlFor="pdf-file-input"
                className={`block w-full border-2 border-dashed rounded-[8px] p-6 text-center cursor-pointer transition-all ${
                  selectedFile
                    ? 'border-[#0075de] bg-[#0075de]/5'
                    : 'border-[#e6e6e6] hover:border-[#0075de]/40 hover:bg-[#f6f5f4]'
                }`}
              >
                {selectedFile ? (
                  <div>
                    <p className="text-[14px] font-semibold text-[#0075de] break-all">{selectedFile.name}</p>
                    <p className="text-[12px] text-[#615d59] mt-0.5">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-[#a39e98]">
                      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                      <path d="M12 12v9" />
                      <path d="m16 16-4-4-4 4" />
                    </svg>
                    <p className="text-[14px] text-[#615d59] mt-2">Click to select a PDF</p>
                    <p className="text-[12px] text-[#a39e98] mt-0.5">PDF files only</p>
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

            {error && (
              <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-[8px] text-[14px] text-red-600">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#e6e6e6]">
              <button
                type="button"
                onClick={onClose}
                className="text-[15px] font-medium text-[#615d59] hover:text-black transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || !selectedFile || !category}
                className="bg-[#0075de] text-white rounded-full px-5 py-2.5 text-[16px] font-medium hover:bg-[#005bab] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Upload PDF'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
