import React from 'react';

export interface PatientIntakeCardProps {
  patientName: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  caseNumber: number;
  totalCases: number;
}

export function PatientIntakeCard({
  patientName,
  age,
  gender,
  chiefComplaint,
  difficulty,
  caseNumber,
  totalCases,
}: PatientIntakeCardProps) {
  const initials = patientName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="w-full bg-[#f6f5f4] border-b border-[#e6e6e6] px-4 sm:px-6 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left section: Avatar + Text */}
        <div className="flex items-start sm:items-center gap-3">
          {/* Avatar */}
          <div className="flex-none w-10 h-10 rounded-full bg-[#2a9d99] text-white flex items-center justify-center font-semibold text-[15px]">
            {initials}
          </div>

          {/* Text Container */}
          <div className="flex flex-col gap-0.5 sm:gap-1">
            {/* Top Row: Name, Age, Gender, Mobile Badge */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[15px] text-[#000000] font-semibold">
                {patientName}
              </span>
              {age > 0 && (
                <>
                  <span className="text-[15px] text-[#615d59]">·</span>
                  <span className="text-[15px] text-[#31302e] whitespace-nowrap">
                    {age} y/o
                  </span>
                </>
              )}
              {gender && (
                <>
                  <span className="text-[15px] text-[#615d59]">·</span>
                  <span className="text-[15px] text-[#31302e]">
                    {gender}
                  </span>
                </>
              )}
              
              {/* Badge on mobile */}
              <div className="sm:hidden ml-1 px-2 py-0.5 bg-white text-[#0075de] text-[12px] font-semibold rounded-full border border-[#e6e6e6] leading-[1.33] tracking-[0.125px]">
                {difficulty}
              </div>
            </div>

            {/* Bottom Row: Chief Complaint */}
            <div className="text-[15px] text-[#31302e]">
              <span className="text-[#615d59]">🩺 Chief complaint: </span>
              <span className="italic">{chiefComplaint}</span>
            </div>
          </div>
        </div>

        {/* Right section: Badge + Case Count */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-end w-full sm:w-auto mt-1 sm:mt-0">
          {/* Badge on desktop */}
          <div className="hidden sm:flex px-2 py-0.5 bg-white text-[#0075de] text-[12px] font-semibold rounded-full border border-[#e6e6e6] leading-[1.33] tracking-[0.125px] mb-1">
            {difficulty}
          </div>
          {/* Case count */}
          <div className="text-[14px] text-[#a39e98] leading-[1.43]">
            Case {caseNumber} of {totalCases}
          </div>
        </div>
      </div>
    </div>
  );
}
