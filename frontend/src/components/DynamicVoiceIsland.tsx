'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square } from 'lucide-react';

interface DynamicVoiceIslandProps {
  onTranscription: (text: string) => void;
  isPatientTalking: boolean;
}

// Extend Window interface for speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const DynamicVoiceIsland: React.FC<DynamicVoiceIslandProps> = ({
  onTranscription,
  isPatientTalking,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
          // If stopped naturally or manually, transcript is already updated
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          if (event.error === 'not-allowed') {
            alert('Microphone access was denied. Please click the camera/microphone icon in your browser URL bar to allow microphone access for this site.');
          }
        };
      } else {
        console.warn('SpeechRecognition API not supported in this browser.');
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      if (transcript.trim()) {
        onTranscription(transcript.trim());
        setTranscript('');
      }
    } else {
      // Start recording
      if (recognitionRef.current) {
        setTranscript('');
        try {
          recognitionRef.current.start();
          setIsRecording(true);
        } catch (error) {
          console.error('Error starting speech recognition:', error);
        }
      } else {
        alert('Speech recognition is not supported in your browser.');
      }
    }
  };

  // If the patient (AI) is talking or we are recording, it's expanded.
  const isExpanded = isRecording || isPatientTalking;

  return (
    <div className="relative inline-flex items-center justify-center">
      <style>{`
        @keyframes waveform {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
        .waveform-bar {
          animation: waveform 1s infinite ease-in-out;
          transform-origin: center;
        }
        .waveform-bar:nth-child(1) { animation-delay: 0.0s; }
        .waveform-bar:nth-child(2) { animation-delay: 0.2s; }
        .waveform-bar:nth-child(3) { animation-delay: 0.4s; }
        .waveform-bar:nth-child(4) { animation-delay: 0.6s; }
        .waveform-bar:nth-child(5) { animation-delay: 0.8s; }
      `}</style>
      
      <button
        onClick={toggleRecording}
        disabled={isPatientTalking}
        className={`
          flex items-center justify-center transition-all duration-300 ease-in-out overflow-hidden
          ${isExpanded
            ? 'w-32 h-10 rounded-full bg-black dark:bg-[#1a1918] shadow-lg'
            : 'w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
          }
          ${isPatientTalking ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}
        `}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        {!isExpanded && (
          <Mic className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        )}
        
        {isExpanded && (
          <div className="flex items-center justify-between w-full px-4 h-full">
            {isRecording && !isPatientTalking && (
              <Square className="w-4 h-4 text-red-500 mr-2 shrink-0" fill="currentColor" />
            )}
            
            <div className="flex items-center space-x-1 h-5 w-full justify-center">
              {isPatientTalking ? (
                // AI is speaking -> all blue bars
                <>
                  <div className="waveform-bar w-1 h-full rounded-full bg-blue-500"></div>
                  <div className="waveform-bar w-1 h-full rounded-full bg-blue-500"></div>
                  <div className="waveform-bar w-1 h-full rounded-full bg-blue-500"></div>
                  <div className="waveform-bar w-1 h-full rounded-full bg-blue-500"></div>
                  <div className="waveform-bar w-1 h-full rounded-full bg-blue-500"></div>
                </>
              ) : (
                // User is speaking -> vibrant colors
                <>
                  <div className="waveform-bar w-1 h-full rounded-full bg-green-400"></div>
                  <div className="waveform-bar w-1 h-full rounded-full bg-yellow-400"></div>
                  <div className="waveform-bar w-1 h-full rounded-full bg-pink-500"></div>
                  <div className="waveform-bar w-1 h-full rounded-full bg-blue-400"></div>
                  <div className="waveform-bar w-1 h-full rounded-full bg-purple-500"></div>
                </>
              )}
            </div>
          </div>
        )}
      </button>
    </div>
  );
};
