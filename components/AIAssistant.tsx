
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Bot, X, Send, Sparkles, Maximize2, Minimize2, Trash2, Mic, MicOff, Radio, Volume2, Activity } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { askGemini } from '../services/gemini';

// --- Types ---
interface Message {
  role: 'user' | 'ai';
  text: string;
}

// --- Hardcoded Habit Definitions ---
const DAILY_HABITS_DEF = [
  { id: 'd1', label: '☀️ Levantarme a las 10:00 max' },
  { id: 'd2', label: '💧 Tomar 2L de Agua' },
  { id: 'd3', label: '📖 Leer' },
  { id: 'd4', label: '💪🏼 Push Ups' },
  { id: 'd5', label: '💻 1h Agencia (Deepwork)' },
  { id: 'd6', label: '🥗 Comer 3 Veces + Registro' },
  { id: 'd7', label: '💊 Tomar Proteina + Creatina' },
  { id: 'd8', label: '🗒️ Registrar Día' },
  { id: 'd9', label: '🪥 Lavarme los Dientes 3 Veces' },
  { id: 'd10', label: '🌙 Acostarme a las 23:59 max' },
];

const WEEKLY_HABITS_DEF = [
  { id: 'w1', label: '🏋🏼 Ejercicio x2 (Lun y Jue)' },
  { id: 'w2', label: '📅 Planificación Semanal (Dom)' },
  { id: 'w3', label: '✍🏼 Escribir Libro 20m' },
  { id: 'w4', label: '🎵 Música 20m' },
  { id: 'w5', label: '🎨 Arte 20m' },
  { id: 'w6', label: '📸 1 Reel' },
  { id: 'w7', label: '⚖️ Registrar Peso (Dom)' },
  { id: 'w8', label: '🍃 Actividad Recreativa Consu' },
];

const MONTHLY_HABITS_DEF = [
  { id: 'm1', label: '🔍 Revisión Completa del Mes' },
  { id: 'm2', label: '🎬 1 Video de Youtube' },
  { id: 'm3', label: '🧑🏼‍🦳 Visitar Abueli' },
  { id: 'm4', label: '🏠 Proyecto Casa Propia 1h' },
  { id: 'm5', label: '🤫 30m sin hacer NADA' },
];

// --- Audio Helper Functions (PCM) ---
function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  const uint8 = new Uint8Array(int16.buffer);
  let binary = '';
  const len = uint8.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  const b64 = btoa(binary);
  
  return {
    data: b64,
    mimeType: 'audio/pcm;rate=16000',
  } as unknown as Blob; 
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- Context Gathering Helper ---
const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const gatherContext = () => {
    const getLS = (key: string) => {
        try {
            return JSON.parse(localStorage.getItem(key) || '{}');
        } catch { return {}; }
    };

    const goals = getLS('rpg_goals_2026_v4');
    const projects = getLS('projects_data');
    const journal = getLS('journal_entries'); 
    
    // History Maps: { "YYYY-MM-DD": { "habitId": true } }
    const habitsDailyHistory = getLS('habits_daily_history_v1');
    const habitsWeeklyHistory = getLS('habits_weekly_history_v1');
    
    const todayStr = getTodayStr(); // Use local time consistent with HabitTracker
    const todayDailyStatus = habitsDailyHistory[todayStr] || {};
    
    // Explicitly find pending items
    const pendingDailyHabits = DAILY_HABITS_DEF.filter(h => !todayDailyStatus[h.id]).map(h => h.label);
    
    const dailyHabitsState = DAILY_HABITS_DEF.map(h => ({
        label: h.label,
        status: todayDailyStatus[h.id] ? 'COMPLETADO' : 'PENDIENTE'
    }));

    // Weekly logic (simplified)
    const weeklyHabitsState = WEEKLY_HABITS_DEF.map(h => {
        const isDoneToday = habitsWeeklyHistory[todayStr]?.[h.id];
        return { label: h.label, status: isDoneToday ? 'HECHO HOY' : 'PENDIENTE ESTA SEMANA' };
    });
    
    const recentJournal = journal ? Object.entries(journal).sort().slice(-8) : [];

    return JSON.stringify({
        currentDate: new Date().toLocaleString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        URGENT_PENDING_DAILY_HABITS: pendingDailyHabits, // High Priority List
        ALL_DAILY_STATUS: dailyHabitsState,
        WEEKLY_STATUS: weeklyHabitsState,
        METAS_ANUALES: goals,
        PROYECTOS_ACTIVOS: projects,
        ULTIMOS_DIAS_JOURNAL: recentJournal,
    }, null, 2);
};

// --- Live Component ---
const LiveVoiceInterface: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [status, setStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('connecting');
    const [isMuted, setIsMuted] = useState(false);
    const [volumeLevel, setVolumeLevel] = useState(0); 
    
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const streamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    
    useEffect(() => {
        startSession();
        return () => stopSession();
    }, []);

    const startSession = async () => {
        try {
            setStatus('connecting');
            const apiKey = process.env.API_KEY || '';
            if (!apiKey) throw new Error("No API Key");

            const ai = new GoogleGenAI({ apiKey });
            
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const contextData = gatherContext();
            
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                    },
                    systemInstruction: `Eres el asistente de voz de Life OS. 
                    CONTEXTO JSON: ${contextData}
                    
                    REGLA DE ORO - PRIORIDADES:
                    1. Revisa 'URGENT_PENDING_DAILY_HABITS'. Si esa lista NO está vacía, DEBES decir: "Aún te faltan estos hábitos: [lista]. Hazlos ahora." NO HABLES DE NADA MÁS.
                    2. Solo si esa lista está vacía, revisa Metas Anuales o Proyectos.
                    
                    Sé estricto y breve.`,
                },
                callbacks: {
                    onopen: () => {
                        console.log("Live Session Opened");
                        setStatus('connected');
                        setupAudioInput();
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (base64Audio && outputAudioContextRef.current) {
                            const ctx = outputAudioContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                            
                            const audioBuffer = await decodeAudioData(
                                decode(base64Audio),
                                ctx,
                                24000,
                                1
                            );
                            
                            const source = ctx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(ctx.destination);
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                        }
                    },
                    onclose: () => {
                        if (status !== 'error') setStatus('disconnected');
                    },
                    onerror: (e) => {
                        console.error("Live Session Error", e);
                        setStatus('error');
                    }
                }
            });
            sessionPromiseRef.current = sessionPromise;

        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    const setupAudioInput = () => {
        if (!inputAudioContextRef.current || !streamRef.current || !sessionPromiseRef.current) return;
        
        const ctx = inputAudioContextRef.current;
        const source = ctx.createMediaStreamSource(streamRef.current);
        const processor = ctx.createScriptProcessor(4096, 1, 1);
        
        processor.onaudioprocess = (e) => {
            if (isMuted) return;
            const inputData = e.inputBuffer.getChannelData(0);
            let sum = 0;
            for(let i=0; i<inputData.length; i++) sum += Math.abs(inputData[i]);
            setVolumeLevel(Math.min(100, (sum / inputData.length) * 500));
            const pcmBlob = createBlob(inputData);
            sessionPromiseRef.current?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
            });
        };

        source.connect(processor);
        processor.connect(ctx.destination);
        sourceRef.current = source;
        processorRef.current = processor;
    };

    const stopSession = () => {
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        if (processorRef.current && sourceRef.current) {
            sourceRef.current.disconnect();
            processorRef.current.disconnect();
        }
        if (inputAudioContextRef.current) inputAudioContextRef.current.close();
        if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    };

    const toggleMute = () => setIsMuted(!isMuted);

    return (
        <div className="flex flex-col h-full bg-[#161822] rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <div className={`w-64 h-64 rounded-full bg-blue-500 blur-3xl transition-all duration-100 ease-out`} style={{ transform: `scale(${1 + volumeLevel/50})` }} />
                <div className={`absolute w-40 h-40 rounded-full bg-indigo-500 blur-2xl transition-all duration-100 ease-out`} style={{ transform: `scale(${1 + volumeLevel/30})` }} />
            </div>

            <div className="relative z-10 flex justify-between items-center p-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <Radio className={`animate-pulse ${status === 'connected' ? 'text-red-500' : 'text-gray-500'}`} size={16} />
                    <span className="text-white font-bold text-sm">Gemini Live</span>
                </div>
                <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                    <X size={16} />
                </button>
            </div>

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-8">
                {status === 'connecting' && <div className="text-blue-400 animate-pulse font-medium">Connecting...</div>}
                {status === 'error' && (
                    <div className="text-red-400 font-medium flex flex-col items-center gap-2">
                        <span>Connection Lost</span>
                        <button onClick={() => { stopSession(); setTimeout(startSession, 500); }} className="px-4 py-2 bg-white/10 rounded-full text-sm hover:bg-white/20">Retry</button>
                    </div>
                )}
                {status === 'connected' && (
                    <div className="relative">
                        <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-[0_0_40px_rgba(79,70,229,0.4)] relative`}>
                            <div className={`absolute inset-0 rounded-full border-2 border-white/20 ${isMuted ? '' : 'animate-ping opacity-20'}`} />
                            {isMuted ? <MicOff size={40} className="text-white/50" /> : <Activity size={40} className="text-white animate-pulse" />}
                        </div>
                    </div>
                )}
                <p className="text-gray-400 text-sm max-w-[200px] text-center">{isMuted ? "Microphone muted" : "Listening..."}</p>
            </div>

            <div className="relative z-10 p-6 flex justify-center gap-6">
                <button onClick={toggleMute} className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white'}`}>
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
                <button onClick={onClose} className="p-4 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/40">
                    <Radio size={24} />
                </button>
            </div>
        </div>
    );
};

// --- Main AIAssistant Component ---

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'chat' | 'live'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Hola. Soy tu copiloto del Proyecto 365. ¿En qué nos enfocamos ahora?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => { scrollToBottom(); }, [messages, isOpen, mode]);
  useEffect(() => { if (isOpen && mode === 'chat' && inputRef.current) inputRef.current.focus(); }, [isOpen, mode]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const contextData = gatherContext();
    const systemInstruction = `
      Eres el Asistente Inteligente del "Proyecto 365". Tu misión es la DISCIPLINA EXTREMA.
      
      DATOS DEL USUARIO: 
      ${contextData}
      
      PROTOCOLO DE PRIORIDAD ESTRICTA (NO IGNORAR):
      1. **HÁBITOS DIARIOS PENDIENTES**:
         - Mira la lista 'URGENT_PENDING_DAILY_HABITS'. 
         - SI ESTA LISTA TIENE ELEMENTOS, DETENTE AQUÍ.
         - Tu respuesta DEBE ser: "No has completado tus hábitos diarios: [listar elementos]. Hazlos ahora."
         - NO sugieras proyectos ni metas anuales si hay hábitos diarios pendientes.
      
      2. **HÁBITOS SEMANALES**:
         - Si 'URGENT_PENDING_DAILY_HABITS' está vacía, revisa 'WEEKLY_STATUS'.
         
      3. **METAS Y PROYECTOS**:
         - Solo si todo lo anterior está perfecto, sugiere avanzar en 'PROYECTOS_ACTIVOS'.
      
      FORMATO: Coach estricto, breve y directo.
    `;

    const aiResponse = await askGemini(userMsg, { systemInstruction });

    setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    setIsLoading(false);
  };

  const clearChat = () => setMessages([{ role: 'ai', text: 'Memoria de chat reiniciada. Sigo teniendo todo el contexto.' }]);

  return (
    <>
        {!isOpen && (
            <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 rounded-full shadow-lg shadow-indigo-900/40 hover:scale-110 transition-all duration-300 border border-white/10 group">
                <Bot size={28} className="group-hover:animate-bounce" />
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-[#0f111a]"></span>
            </button>
        )}

        {isOpen && (
            <div className={`fixed z-50 bg-[#161822] border border-gray-700/80 shadow-2xl flex flex-col transition-all duration-300 backdrop-blur-md overflow-hidden ${isExpanded ? 'inset-4 md:inset-10 rounded-2xl' : 'bottom-6 right-6 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] rounded-2xl'}`}>
                {mode === 'live' ? (
                    <LiveVoiceInterface onClose={() => setMode('chat')} />
                ) : (
                    <>
                        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gradient-to-r from-indigo-900/20 to-blue-900/20">
                            <div className="flex items-center gap-2">
                                <div className="bg-indigo-500/20 p-1.5 rounded-lg border border-indigo-500/30">
                                    <Sparkles size={18} className="text-indigo-400" />
                                </div>
                                <div><h3 className="font-bold text-white text-sm">Life OS AI</h3></div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={clearChat} className="p-2 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors hidden md:block">{isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}</button>
                                <button onClick={() => setIsOpen(false)} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"><X size={18} /></button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#0f111a]/50">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-[#1c1f2e] text-gray-200 border border-gray-800 rounded-bl-none'}`}>
                                        <div className="whitespace-pre-wrap">{msg.text}</div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-[#1c1f2e] text-gray-400 p-3 rounded-2xl rounded-bl-none border border-gray-800 flex items-center gap-2 text-xs">
                                        <Sparkles size={12} className="animate-spin" />
                                        <span>Analizando...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-3 border-t border-gray-800 bg-[#161822]">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="Escribe algo..."
                                        className="w-full bg-[#0f111a] border border-gray-700 text-white text-sm rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-gray-500"
                                    />
                                    <button onClick={handleSend} disabled={!input.trim() || isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition-colors">
                                        <Send size={16} />
                                    </button>
                                </div>
                                <button onClick={() => setMode('live')} className="px-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl border border-red-500/20 transition-all flex items-center justify-center" title="Modo Voz en Vivo">
                                    <Radio size={20} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        )}
    </>
  );
};

export default AIAssistant;
