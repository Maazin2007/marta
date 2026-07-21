"use client";

export default function ResearcherLogin() {
  return (
    <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-xl shadow-2xl">
      {/* 
        DESIGN CHOICE: We use a fixed max-width (max-w-md) centered container here 
        so that the login form doesn't stretch awkwardly across wide desktop monitors.
        
        w-full: Take up 100% of the available width
        max-w-md: But never get wider than "medium" (around 448 pixels)
        bg-zinc-900: Dark gray background color
        border border-zinc-800: Give it a thin border that is a slightly lighter gray
        p-8: "Padding 8" - Put a good amount of empty space inside the box
        rounded-xl: Give the corners a nice "extra-large" rounding
        shadow-2xl: Give the box a deep drop-shadow underneath so it pops
      */}

      {/* 
        text-2xl: Make the text size large
        font-bold: Make the text bold
        text-white: Make the text color white
        mb-6: "Margin Bottom 6" - Push whatever is below this title down
        text-center: Center the text
      */}
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Researcher Access
      </h2>

      {/* 
        DESIGN CHOICE: We use flexbox with column direction (flex-col) instead of Grid 
        because we just want a simple top-to-bottom stack of inputs. Grid is better 
        for 2D layouts (rows AND columns), but Flex is perfect for a 1D vertical stack.

        flex: Turn on flexbox
        flex-col: Stack the items vertically inside this box (like a column)
        gap-4: Automatically put 16px (gap-4) of space between every single input
      */}
      <div className="flex flex-col gap-4">
        
        <div>
          {/* 
            text-zinc-400: Make the label text a medium-light gray color
            text-sm: Make the text size small
            mb-1: "Margin Bottom 1" - Push the input box below it down just a tiny bit
            block: Make this label take up the whole line so the input drops below it
          */}
          <label className="text-zinc-400 text-sm mb-1 block">Email</label>
          
          {/* 
            w-full: Take up 100% of the width of its parent container
            bg-black: Pitch black background for the input box
            border border-zinc-800: Dark gray border around the input
            text-white: When the user types, the text should be white
            rounded: Give the input box slightly rounded corners
            px-3 py-2: "Padding X 3, Padding Y 2" - Internal spacing for the text
          */}
          <input type="email" className="w-full bg-black border border-zinc-800 text-white rounded px-3 py-2" placeholder="admin@marta.edu" />
        </div>

        <div>
          <label className="text-zinc-400 text-sm mb-1 block">Password</label>
          <input type="password" className="w-full bg-black border border-zinc-800 text-white rounded px-3 py-2" />
        </div>

        <div>
          <label className="text-zinc-400 text-sm mb-1 block">6-Digit PIN</label>
          <input type="text" maxLength={6} className="w-full bg-black border border-zinc-800 text-white rounded px-3 py-2" placeholder="123456" />
        </div>

        {/* 
          DESIGN CHOICE: We use a purple button (bg-purple-600) here to visually 
          distinguish the Researcher login from the Student login (which is blue/green).
          
          mt-4: "Margin Top 4" - Push this button down away from the PIN input
          w-full: Make the button 100% width
          hover:bg-purple-700: When the user hovers their mouse over it, make it a darker purple
          text-white: Make the button text white
          font-semibold: Make the text slightly bold
          py-2: "Padding Y 2" - Make the button taller
          rounded: Give it rounded corners
          transition-colors: Smoothly fade the color on hover
        */}
        <button className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded transition-colors">
          Access Admin Dashboard
        </button>
      </div>
    </div>
  );
}
