'use client';

import React, { useState, useEffect } from 'react';

export interface FeedbackPayload {
  sessionId: string;
  satisfaction: number;
  answeredAllQuestions: number;
  naturalness: number;
  improvedCommunication: number;
  improvedConfidence: number;
  contributionToDevelopment: number;
  ableToAskAllQuestions: number;
  wouldRecommend: number;
  shouldBeInCurriculum: number;
  diagnosticConfidence: number;
  studentDiagnosisReasoning: string;
  suggestedModifications: string;
}

export interface PostDiagnosisSurveyProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FeedbackPayload) => void;
  sessionId: string;
}

export const PostDiagnosisSurvey: React.FC<PostDiagnosisSurveyProps> = ({
  isOpen,
  onClose,
  onSubmit,
  sessionId,
}) => {
  const [formData, setFormData] = useState({
    satisfaction: 0,
    answeredAllQuestions: 0,
    naturalness: 0,
    improvedCommunication: 0,
    improvedConfidence: 0,
    contributionToDevelopment: 0,
    ableToAskAllQuestions: 0,
    wouldRecommend: 0,
    shouldBeInCurriculum: 0,
    diagnosticConfidence: 0,
    studentDiagnosisReasoning: '',
    suggestedModifications: '',
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  const handleRatingChange = (field: keyof FeedbackPayload, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTextChange = (field: keyof FeedbackPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid =
    formData.satisfaction > 0 &&
    formData.answeredAllQuestions > 0 &&
    formData.naturalness > 0 &&
    formData.improvedCommunication > 0 &&
    formData.improvedConfidence > 0 &&
    formData.contributionToDevelopment > 0 &&
    formData.ableToAskAllQuestions > 0 &&
    formData.wouldRecommend > 0 &&
    formData.shouldBeInCurriculum > 0 &&
    formData.diagnosticConfidence > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    onSubmit({
      ...formData,
      sessionId,
    });
    
    // Reset form after submission
    setFormData({
      satisfaction: 0,
      answeredAllQuestions: 0,
      naturalness: 0,
      improvedCommunication: 0,
      improvedConfidence: 0,
      contributionToDevelopment: 0,
      ableToAskAllQuestions: 0,
      wouldRecommend: 0,
      shouldBeInCurriculum: 0,
      diagnosticConfidence: 0,
      studentDiagnosisReasoning: '',
      suggestedModifications: '',
    });
  };

  const renderRating = (field: keyof FeedbackPayload, label: string, leftLabel: string, rightLabel: string) => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="flex justify-between items-center gap-2">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleRatingChange(field, num)}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full font-semibold text-lg transition-all flex items-center justify-center ${
              (formData[field] as number) === num
                ? 'bg-[#0075de] text-white shadow-md transform scale-110'
                : 'bg-gray-100 dark:bg-[#2a2928] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#3a3938]'
            }`}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2 px-1">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div
        className={`relative w-full max-w-2xl bg-white dark:bg-[#1a1918] rounded-[16px] shadow-2xl p-6 sm:p-8 transition-all duration-300 transform flex flex-col max-h-[90vh] ${
          isOpen ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'
        }`}
      >
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Clinical Experience Survey
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/5"
            aria-label="Close survey"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6 shrink-0">
          Please provide feedback on your clinical encounter. All fields are required.
        </p>

        <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 mb-6 space-y-2">
          <form id="survey-form" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">The Encounter</h3>
              {renderRating('satisfaction', 'Overall satisfaction with the encounter', 'Poor', 'Excellent')}
              {renderRating('naturalness', 'How natural/realistic was the patient?', 'Not Realistic', 'Very Realistic')}
              {renderRating('answeredAllQuestions', 'Did the AI answer all questions properly?', 'Not at all', 'Completely')}
              {renderRating('ableToAskAllQuestions', 'Were you able to ask all necessary questions?', 'Strongly Disagree', 'Strongly Agree')}
              
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 mt-8 border-b border-gray-200 dark:border-gray-700 pb-2">Your Development</h3>
              {renderRating('diagnosticConfidence', 'How confident were you in your final diagnosis?', 'Not Confident', 'Very Confident')}
              {renderRating('improvedCommunication', 'Did this improve your communication skills?', 'Not at all', 'Significantly')}
              {renderRating('improvedConfidence', 'Did this improve your clinical confidence?', 'Not at all', 'Significantly')}
              {renderRating('contributionToDevelopment', 'Contribution to your professional development', 'None', 'High')}
              
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 mt-8 border-b border-gray-200 dark:border-gray-700 pb-2">Curriculum & Feedback</h3>
              {renderRating('wouldRecommend', 'Would you recommend this to a peer?', 'Definitely Not', 'Definitely')}
              {renderRating('shouldBeInCurriculum', 'Should this be integrated into the curriculum?', 'Strongly Disagree', 'Strongly Agree')}

              <div className="mb-6">
                <label htmlFor="studentDiagnosisReasoning" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Explain your reasoning for the diagnosis
                </label>
                <textarea
                  id="studentDiagnosisReasoning"
                  rows={3}
                  value={formData.studentDiagnosisReasoning}
                  onChange={(e) => handleTextChange('studentDiagnosisReasoning', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2a2928] bg-gray-50 dark:bg-[#2a2928] px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0075de]/50 focus:border-[#0075de] transition-colors resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="Your clinical reasoning..."
                />
              </div>

              <div className="mb-2">
                <label htmlFor="suggestedModifications" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Any suggested modifications or technical issues?
                </label>
                <textarea
                  id="suggestedModifications"
                  rows={3}
                  value={formData.suggestedModifications}
                  onChange={(e) => handleTextChange('suggestedModifications', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2a2928] bg-gray-50 dark:bg-[#2a2928] px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0075de]/50 focus:border-[#0075de] transition-colors resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="Feedback or issues..."
                />
              </div>
            </div>
          </form>
        </div>

        <div className="shrink-0 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            type="submit"
            form="survey-form"
            disabled={!isFormValid}
            className="w-full bg-[#0075de] text-white font-semibold py-3.5 px-6 rounded-xl hover:bg-[#0060b8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostDiagnosisSurvey;
