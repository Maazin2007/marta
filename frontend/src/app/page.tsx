"use client";
import { useState } from "react";
import StudentAuth from "./components/StudenAuth";
import ResearcherLogin from "./components/ResearcherLogin";

export default function Home() {
  // This state tracks which tab is currently selected.
  // It defaults to "student" so they see the Student login first.
  const [activeTab, setActiveTab] = useState<"student" | "researcher">("student");

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-950 font-sans min-h-screen text-zinc-50">
      {/*
        DESIGN CHOICE: We use 'min-h-screen' to ensure the black background stretches
        all the way to the bottom of the screen, even if the content is short.

        flex flex-col: Stack the header, tabs, and form vertically
        items-center: Center them horizontally on the screen
        justify-center: Center them vertically on the screen
        bg-zinc-950: Very dark, almost pitch-black background
        min-h-screen: Take up at least 100% of the screen height
        text-zinc-50: Make default text white
      */}

      {/*
        DESIGN CHOICE: We wrap the content in a <main> tag for accessibility (screen readers
        look for the <main> tag to know where the primary content is).

        flex flex-col: Vertical stack
        w-full: 100% width
        max-w-md: But cap it at "medium" width so it perfectly matches the forms below
        items-center: Center the contents
        p-8: "Padding 8" - Add breathing room inside
      */}
      <main className="flex flex-col w-full max-w-md items-center p-8">
        <h1 className="text-4xl font-bold mb-8 tracking-tight">
          Welcome to Marta
        </h1>

        {/* ================= TABS ================= */}
        {/*
          DESIGN CHOICE: We use a pill-shaped container to hold the toggle buttons.
          It gives a sleek, native app feel.

          flex: Put the two buttons side-by-side
          w-full: Take up 100% of the width
          bg-zinc-900: Dark gray background for the pill
          p-1: "Padding 1" - Tiny bit of space inside the pill
          rounded-lg: Rounded corners for the pill
          mb-8: "Margin Bottom 8" - Space between tabs and the form below
        */}
        <div className="flex w-full bg-zinc-900 p-1 rounded-lg mb-8">
          {/*
            DESIGN CHOICE: We use a ternary operator (?) to dynamically change the Tailwind
            classes based on whether this tab is active or not!

            If activeTab === "student":
              bg-zinc-800 text-white shadow-sm (Make it look pressed/highlighted)
            Else:
              text-zinc-400 hover:text-white (Make it look faded out)
          */}
          <button
            onClick={() => setActiveTab("student")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "student"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Student
          </button>

          <button
            onClick={() => setActiveTab("researcher")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "researcher"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Researcher
          </button>
        </div>

        {/* ================= CONDITIONAL RENDERING ================= */}
        {/*
          If the active tab is "student", render our StudentAuth component.
          Otherwise, render our ResearcherLogin component.
        */}
        <div className="w-full">
          {activeTab === "student" ? <StudentAuth /> : <ResearcherLogin />}
        </div>
      </main>
    </div>
  );
}
