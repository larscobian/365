import React, { useState } from 'react';
import { ArrowRight, Mic, Send } from 'lucide-react';
import { askGemini } from '../services/gemini';

const WelcomeCard: React.FC = () => {
  const [isAsking, setIsAsking] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse('');
    const res = await askGemini(prompt);
    setResponse(res);
    setLoading(false);
  };

  return (
    <div className="relative bg-gradient-to-r from-blue-900 to-purple-900 rounded-2xl p-6 md:p-8 overflow-hidden flex flex-col justify-between min-h-[280px] group">
      {/* Background Image Overlay */}
      <div className="absolute right-0 top-0 w-full h-full opacity-60 mix-blend-screen pointer-events-none">
         {/* Using a specific underwater/jellyfish like image from picsum/unsplash logic */}
         <img 
            src="https://picsum.photos/id/28/800/600" 
            alt="Background" 
            className="w-full h-full object-cover mask-image-gradient"
            style={{ maskImage: 'linear-gradient(to left, black, transparent)' }}
         />
      </div>
      
      <div className="relative z-10 max-w-md">
        <h3 className="text-gray-300 text-sm mb-1">Welcome back,</h3>
        <h2 className="text-3xl font-bold text-white mb-4">Mark Johnson</h2>
        
        {!isAsking ? (
            <>
                <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                Glad to see you again! <br/>
                Ask me anything.
                </p>
                <button 
                    onClick={() => setIsAsking(true)}
                    className="flex items-center gap-2 text-sm text-white font-medium hover:gap-3 transition-all"
                >
                    Tap to record <ArrowRight size={16} />
                </button>
            </>
        ) : (
            <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 animate-in fade-in slide-in-from-bottom-4">
                 <div className="flex gap-2 mb-2">
                    <input 
                        type="text" 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                        placeholder="Ask the AI..."
                        className="bg-transparent border-b border-white/30 w-full text-white placeholder-gray-400 focus:outline-none focus:border-white pb-1"
                        autoFocus
                    />
                    <button onClick={handleAsk} disabled={loading} className="text-blue-300 hover:text-white">
                        <Send size={18} />
                    </button>
                 </div>
                 <div className="text-xs text-gray-200 min-h-[40px] max-h-[100px] overflow-y-auto">
                     {loading ? <span className="animate-pulse">Thinking...</span> : response || "Type above and press Enter."}
                 </div>
                 <button onClick={() => setIsAsking(false)} className="text-xs text-gray-400 mt-2 hover:text-white">Close</button>
            </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeCard;