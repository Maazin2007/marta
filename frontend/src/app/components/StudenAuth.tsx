"use client" // This is a client component
import { useState } from "react"

export default function StudentAuth() {
    // we need State to remember if we are showing Login Form (true) or Register Form (false)
    const [isLogin, setIsLogin] = useState(true)

    return (
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-xl shadow-2xl">
            {/* This is the main heading for the box */}
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
                {isLogin ? "Student Login" : "Student Registration"}
            </h2>
            {/* This is the Actual input form depending on what the login Status is */}

            {isLogin ? (
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="text-zinc-400 text-sm mb-1 block">Participant ID</label>
                        <input type="text" className="w-full bg-black border border-zinc-800 text-white rounded px-3 py-2" placeholder="e.g. A1B2C3D4" />
                    </div>
                    <div>
                        <label className="text-zinc-400 text-sm mb-1 block">Password</label>
                        <input type="text" className="w-full bg-black border border-zinc-800 text-white rounded px-3 py-2"/>
                    </div>
                    <button className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors">
                        Sign in
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-4">                                                             
                                                                                                              
              {/*                                                                                             
                grid grid-cols-2: Turn on CSS Grid and split this section into exactly 2 columns!             
                gap-4: Put a small gap between the two columns                                                
              */}                                                                                             
              <div className="grid grid-cols-2 gap-4">                                                        
                <div>                                                                                         
                  <label className="text-zinc-400 text-sm mb-1 block">Year of Study</label>                   
                  <select className="w-full bg-black border border-zinc-800 text-white rounded px-3 py-2">    
                    <option value="3">3rd Year</option>                                                       
                    <option value="4">4th Year</option>                                                       
                  </select>                                                                                   
                </div>                                                                                        
                <div>                                                                                         
                  <label className="text-zinc-400 text-sm mb-1 block">Sex</label>                             
                  <select className="w-full bg-black border border-zinc-800 text-white rounded px-3 py-2">    
                    <option value="MALE">Male</option>                                                        
                    <option value="FEMALE">Female</option>                                                    
                  </select>                                                                                   
                </div>                                                                                        
              </div>                                                                                          
                                                                                                              
              <div>                                                                                           
                <label className="text-zinc-400 text-sm mb-1 block">Confidence (0.0 - 1.0)</label>            
                <input type="number" step="0.1" className="w-full bg-black border border-zinc-800 text-white rounded px-3 py-2" placeholder="0.75" />                                                                    
              </div>                                                                                          
                                                                                                              
              <div>                                                                                           
                <label className="text-zinc-400 text-sm mb-1 block">Password</label>                          
                <input type="password" className="w-full bg-black border border-zinc-800 text-white rounded px-3 py-2" placeholder="Min 8 characters" />                                                                
              </div>                                                                                          
                                                                                                              
              <div>                                                                                           
                <label className="text-zinc-400 text-sm mb-1 block">6-Digit PIN</label>                       
                <input type="text" maxLength={6} className="w-full bg-black border border-zinc-800 text-white rounded px-3 py-2" placeholder="1234" />                                                                    
              </div>                                                                                          
                                                                                                              
              {/* Same as login button, but using bg-green-600 to visually separate Registration from Login  */}                                                                                                         
              <button className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition-colors">                                                                                 
                Register Account                                                                              
              </button>                                                                                       
            </div>
            )}

            {/* Add a button to toggle between Login and Register */}
            <button onClick={() => setIsLogin(!isLogin)} className="mt-4 w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-center font-semibold py-2 rounded transition-colors">
                {isLogin ? "Don't have an account? Register here." : "Already have an account? Sign in here."}
            </button>

        </div>
    )
} 