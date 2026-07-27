'use client'

import React, { useState, useEffect, useRef } from 'react'

interface NotesPanelProps {
  isOpen: boolean
  onToggle: () => void
  sessionId: string
}

export default function NotesPanel({ isOpen, onToggle, sessionId }: NotesPanelProps) {
  const [notes, setNotes] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  
  const storageKey = `marta_notes_${sessionId}`

  // Load saved notes on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      setNotes(saved)
    }
  }, [storageKey])

  // Handle textarea changes and debounce save
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setNotes(val)
    setSaveStatus('saving')
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    debounceRef.current = setTimeout(() => {
      localStorage.setItem(storageKey, val)
      setSaveStatus('saved')
      
      // Reset saved status after 2 seconds
      setTimeout(() => {
        setSaveStatus(prev => prev === 'saved' ? 'idle' : prev)
      }, 2000)
    }, 500)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-[#000000]/20 z-30 md:hidden transition-opacity"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-[320px] max-w-full bg-[#ffffff] z-40 transform transition-transform duration-300 ease-in-out border-l border-[#e6e6e6] flex flex-col md:rounded-l-[12px] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          boxShadow: '0 0.175px 1.041px rgba(0,0,0,0.01), 0 0.8px 2.925px rgba(0,0,0,0.02), 0 2.025px 7.847px rgba(0,0,0,0.027), 0 4px 18px rgba(0,0,0,0.04)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[16px] py-[12px] border-b border-[#e6e6e6]">
          <h2 className="text-[15px] font-semibold leading-[1.33] text-[#000000]">Clinical Notes</h2>
          <button 
            onClick={onToggle}
            className="text-[#615d59] hover:text-[#000000] transition-colors p-[4px] -mr-[4px]"
            aria-label="Close notes panel"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Textarea */}
        <textarea
          value={notes}
          onChange={handleChange}
          placeholder="Jot down findings, symptoms, observations..."
          className="flex-1 w-full p-[16px] resize-none focus:outline-none bg-[#ffffff] text-[#000000] placeholder:text-[#a39e98] text-[15px] leading-[1.33]"
        />

        {/* Footer */}
        <div className="flex items-center justify-between px-[16px] py-[12px] border-t border-[#e6e6e6]">
          <div className="text-[12px] leading-[1.33] font-semibold tracking-[0.125px]">
            {saveStatus === 'saving' && <span className="text-[#0075de]">Saving...</span>}
            {saveStatus === 'saved' && <span className="text-[#615d59]">Saved</span>}
            {saveStatus === 'idle' && <span>&nbsp;</span>}
          </div>
          <div className="text-[12px] leading-[1.33] font-semibold tracking-[0.125px] text-[#615d59]">
            {notes.length} char{notes.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </>
  )
}
