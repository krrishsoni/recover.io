import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Loader2, Bot, VolumeX, Send, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

type MicPermission = 'unknown' | 'granted' | 'denied' | 'requesting';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

const AIVoiceAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micPermission, setMicPermission] = useState<MicPermission>('unknown');

  const { user, patients, checkIns, tasks, addCaregiverNote } = useAuth();
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);

  // NVIDIA API config
  const apiKey = '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';
  const NVIDIA_API_URL = '/api/nvidia/chat/completions';

  useEffect(() => {
    // Load history from localStorage
    if (user?.id) {
       const key = `recoverai_chat_history_${user.id}`;
       const stored = localStorage.getItem(key);
       if (stored) {
         try {
           setMessages(JSON.parse(stored));
         } catch (e) {
           console.error("Failed to load chat history:", e);
         }
       }
    }
    isMounted.current = true;

    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName }).then((result) => {
        setMicPermission(result.state === 'granted' ? 'granted' : result.state === 'denied' ? 'denied' : 'unknown');
        result.onchange = () => {
          setMicPermission(result.state === 'granted' ? 'granted' : result.state === 'denied' ? 'denied' : 'unknown');
        };
      });
    }
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      if (recognitionRef.current) try { recognitionRef.current.abort(); } catch (_) {}
    };
  }, [user?.id]);

  useEffect(() => {
    // Sync to localStorage whenever messages change
    if (isMounted.current && user?.id) {
       const key = `recoverai_chat_history_${user.id}`;
       localStorage.setItem(key, JSON.stringify(messages));
    }
  }, [messages, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  if (!user) return null;

  const buildContext = () => {
    if (user.role === 'caregiver') {
      return patients.map(p => {
        const pCheckIns = checkIns.filter(c => c.patientId === p.id).slice(0, 5);
        const pTasks = tasks.filter(t => t.patientId === p.id);
        const latestCI = pCheckIns[0];
        return `Patient: ${p.name} (ID:${p.id}) | Age:${p.age} | Diagnosis:${p.diagnosis} | Doctor:${p.doctorName}
Tasks: ${pTasks.filter(t => t.completed).length}/${pTasks.length} done today
Latest check-in: ${latestCI ? `pain:${latestCI.pain}/10, mood:${latestCI.mood}, temp:${latestCI.temperature.toFixed(1)}°F, wound:${latestCI.woundStatus}, symptoms:[${latestCI.symptoms.join(',')||'none'}], alert:${latestCI.alertLevel}` : 'none'}`;
      }).join('\n---\n');
    } else {
      // Patient user: Only provide their own data
      const myPatient = patients.find(p => p.uid === user.uid) || patients.find(p => p.id === user.id);
      if (!myPatient) return `User: ${user.name} (Patient). No medical records found yet.`;
      
      const myCheckIns = checkIns.filter(c => c.patientId === myPatient.id).slice(0, 10);
      const myTasks = tasks.filter(t => t.patientId === myPatient.id);
      const latestCI = myCheckIns[0];
      
      return `User: ${myPatient.name} (Patient) | Age:${myPatient.age} | Diagnosis:${myPatient.diagnosis} | Doctor:${myPatient.doctorName}
Your Tasks today: ${myTasks.filter(t => t.completed).length}/${myTasks.length} completed.
Remaining tasks: ${myTasks.filter(t => !t.completed).map(t => t.title).join(', ')}
Your latest check-in: ${latestCI ? `pain:${latestCI.pain}/10, mood:${latestCI.mood}, temp:${latestCI.temperature.toFixed(1)}°F, wound:${latestCI.woundStatus}, alert:${latestCI.alertLevel}` : 'none'}`;
    }
  };

  const generateLocalReport = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    // Privacy check: Patients shouldn't see others
    const accessiblePatients = user.role === 'caregiver' ? patients : patients.filter(p => p.uid === user.uid || p.id === user.id);
    
    // Find matching patient(s)
    const matchedPatients = accessiblePatients.filter(p => p.name.toLowerCase().split(' ').some(part => lowerQuery.includes(part)) || lowerQuery.includes(p.name.toLowerCase()));
    const targets = matchedPatients.length > 0 ? matchedPatients : accessiblePatients;

    // Intents
    const isReport = /(report|save|log|note|generate)/.test(lowerQuery);
    const isPain = /(pain|hurt|ache|sore|uncomfortable)/.test(lowerQuery);
    const isStatus = /(status|alert|urgent|monitor|stable|condition|doing)/.test(lowerQuery);
    const isTasks = /(task|todo|meds|medication|done|completion|progress)/.test(lowerQuery);

    // Specific Questions
    if (lowerQuery.includes('highest pain') || lowerQuery.includes('most pain') || lowerQuery.includes('worst pain')) {
      const highestPainPatient = [...accessiblePatients].sort((a,b) => {
        const p1 = checkIns.filter(c => c.patientId === b.id)[0]?.pain || 0;
        const p2 = checkIns.filter(c => c.patientId === a.id)[0]?.pain || 0;
        return p1 - p2;
      })[0];
      if (highestPainPatient) {
        const pain = checkIns.filter(c => c.patientId === highestPainPatient.id)[0]?.pain || 0;
        return `${user.role === 'patient' ? 'Your' : highestPainPatient.name + "'s"} current pain level is ${pain}/10.`;
      }
    }

    if (user.role === 'caregiver' && (lowerQuery.includes('how many') || lowerQuery.includes('total patients'))) {
       return `You are currently monitoring ${patients.length} patients and there are ${checkIns.length} check-in logs recorded.`;
    }

    // Specific Analysis (1 Target)
    if (targets.length === 1) {
      const p = targets[0];
      const pCI = checkIns.filter(c => c.patientId === p.id).slice(0, 3);
      const pTasks = tasks.filter(t => t.patientId === p.id);
      const latest = pCI[0];
      const completed = pTasks.filter(t => t.completed).length;
      
      let response = '';

      if (isPain) {
        response = latest ? `${p.name} reported a pain level of ${latest.pain}/10 on their latest check-in. Mood: ${latest.mood}.` : `${p.name} hasn't submitted a pain report yet.`;
      } else if (isTasks) {
        response = `${p.name} has completed ${completed} out of ${pTasks.length} assigned tasks today.`;
      } else if (isStatus) {
        response = latest ? `${p.name}'s condition is ${latest.alertLevel}. Temperature is ${latest.temperature.toFixed(1)}°F. Wound health: ${latest.woundStatus}.` : `No status data stored for ${p.name}.`;
      } else {
        const daysSince = Math.floor((Date.now() - new Date(p.dischargeDate).getTime()) / 86400000);
        response = `${p.name} (${p.age}y) — Day ${daysSince + 1} post-op.\n${latest ? `Pain: ${latest.pain}/10 | Temp: ${latest.temperature.toFixed(1)}°F | Alert: ${latest.alertLevel}\nSymptoms: ${latest.symptoms.length ? latest.symptoms.join(', ') : 'None'}.` : `No check-in data yet.`}\nTasks: ${completed}/${pTasks.length} done.`;
      }

      if (isReport && user.role === 'caregiver') {
         response += `\n[PATIENT_ID: ${p.id}]`;
      }
      return response;
    }

    // Default Overview
    return targets.map(p => {
      const latest = checkIns.filter(c => c.patientId === p.id)[0];
      return `• ${p.name} → ${latest ? `Pain: ${latest.pain}/10, Status: ${latest.alertLevel}` : 'Pending Check-in'}`;
    }).join('\n');
  };

  const processQuery = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { role: 'user', content: text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const systemPrompt = `You are a highly capable AI medical assistant on RecoverAI. You are talking to a ${user.role}.
${user.role === 'caregiver' ? 'You help caregivers monitor multiple patients and generate reports.' : 'You help patients manage their own recovery, tasks, and symptoms.'}
You MUST answer ANY general, conversational, or off-topic question the user asks you naturally, just like a standard GPT model.
Use the following local medical data to provide specific answers:

Medical Data:
${buildContext()}

${user.role === 'caregiver' ? 'If asked to generate/save a report, include [PATIENT_ID: X] in your response.' : 'Do NOT generate patient reports or ID tags for patients.'}
Be brief, professional, and empathetic.`;

      const res = await fetch(NVIDIA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'meta/llama-3.1-8b-instruct',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: text }
          ],
          max_tokens: 400,
          temperature: 0.5
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`API ${res.status}: ${errText.slice(0, 120)}`);
      }

      const data = await res.json();
      const aiText = data.choices?.[0]?.message?.content || "I couldn't generate a response.";
      const idMatch = aiText.match(/\[PATIENT_ID:\s*(\d+)\]/);
      const cleanText = aiText.replace(/\[PATIENT_ID:\s*\d+\]/g, '').trim();

      setMessages(prev => [...prev, { role: 'assistant', content: cleanText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);

      if (idMatch?.[1] && user.role === 'caregiver') {
        const pId = parseInt(idMatch[1]);
        addCaregiverNote({ patientId: pId, caregiverId: user.id || 1, date: new Date().toISOString(), content: `AI Report: ${cleanText}`, tags: ['AI-Report'] });
        toast.success('Report saved to patient notes!');
      }

      speak(cleanText);
    } catch (error: any) {
      console.error('AI Processing:', error.message);
      const fallback = generateLocalReport(text);
      
      const idMatch = fallback.match(/\[PATIENT_ID:\s*(\d+)\]/);
      let displayMsg = fallback;
      
      if (idMatch?.[1] && user.role === 'caregiver') {
        const pId = parseInt(idMatch[1]);
        const cleanText = fallback.replace(/\[PATIENT_ID:\s*\d+\]/g, '').trim();
        displayMsg = `Report generated and saved successfully.\n\n${cleanText}`;
        addCaregiverNote({ patientId: pId, caregiverId: user.id || 1, date: new Date().toISOString(), content: `Local AI Report: ${cleanText}`, tags: ['AI-Report'] });
        toast.success('Offline report saved!');
      } else if (!fallback || text.toLowerCase().includes('hello') || text.toLowerCase().includes('hi')) {
         displayMsg = "I am currently running in offline mode. I can analyze medical data safely, but cloud GPT features are limited.";
      } else {
         displayMsg = `(Offline Analytics) ${fallback}`;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: displayMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      speak(displayMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const doSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const u = new SpeechSynthesisUtterance(text);
      const preferred = voices.find(v => v.lang.startsWith('en') && !v.localService === false) || voices.find(v => v.lang.startsWith('en')) || voices[0];
      if (preferred) u.voice = preferred;
      u.onstart = () => setIsSpeaking(true);
      u.onend = () => setIsSpeaking(false);
      u.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(u);
    };
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) doSpeak();
    else window.speechSynthesis.addEventListener('voiceschanged', doSpeak, { once: true });
  };

  const stopSpeaking = () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); setIsSpeaking(false); };

  const toggleListening = async () => {
    if (isListening) {
      try { 
        recognitionRef.current?.stop(); 
      } catch (_) {}
      setIsListening(false);
      const finalTranscript = transcriptRef.current || transcript;
      if (finalTranscript.trim()) { 
        setTextInput(''); 
        processQuery(finalTranscript); 
        setTranscript(''); 
        transcriptRef.current = '';
      }
      return;
    }
    if (micPermission === 'denied') { toast.error('Mic is blocked.'); return; }
    
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error('Voice not supported.'); return; }

    try {
      if (micPermission !== 'granted') await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new SR();
      rec.continuous = true; rec.interimResults = true; rec.lang = 'en-US';
      rec.onresult = (e: any) => { 
        let fullFinal = '';
        let fullInterim = '';
        
        // Rebuild the entire sentence from the browser's own result buffer (Single Source of Truth)
        for (let i = 0; i < e.results.length; i++) {
          const transcriptSegment = e.results[i][0].transcript;
          if (e.results[i].isFinal) {
            fullFinal += transcriptSegment;
          } else {
            fullInterim += transcriptSegment;
          }
        }
        
        // Update user display with cleaned, unified transcript
        const fullDisplay = (fullFinal + fullInterim).trim();
        setTranscript(fullDisplay);
        
        // Persist ONLY the definitive final results to our persistent reference
        transcriptRef.current = fullFinal.trim();
      };
      rec.onend = () => setIsListening(false);
      recognitionRef.current = rec;
      rec.start();
      setTranscript('');
      transcriptRef.current = '';
      setIsListening(true);
      setMicPermission('granted');
    } catch (e) { toast.error('Could not access mic.'); }
  };

  const handleSend = () => {
    if (!textInput.trim() || isProcessing) return;
    const q = textInput.trim();
    setTextInput('');
    processQuery(q);
  };

  const closeModal = () => {
    stopSpeaking();
    if (isListening) try { recognitionRef.current?.stop(); } catch (_) {}
    setIsListening(false);
    setIsOpen(false);
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear your chat history?')) {
      setMessages([]);
      if (user?.id) localStorage.removeItem(`recoverai_chat_history_${user.id}`);
      toast.success('Chat history cleared!');
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-[9000] w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-[1.5rem] shadow-2xl shadow-violet-500/50 flex items-center justify-center border-2 border-white/20"
      >
        <Bot className="w-8 h-8 text-white" />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0, 0.5, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-white rounded-[1.5rem]" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal} className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9001]" />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="fixed inset-x-4 bottom-4 top-[8%] sm:inset-auto sm:right-6 sm:bottom-6 sm:w-[420px] sm:h-[680px] z-[9002] flex flex-col"
            >
              <div className="glass-card-static rounded-[2.5rem] flex flex-col h-full overflow-hidden border border-white/10" style={{ background: 'rgba(15,12,41,0.95)', backdropFilter: 'blur(40px)' }}>
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-5 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center border border-white/20">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-black text-xl leading-tight">RecoverAI Assistant</h3>
                      <p className="text-violet-200 text-xs font-bold uppercase tracking-widest">{user.role === 'caregiver' ? 'Caregiver Support' : 'Recovery Partner'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSpeaking && (
                      <button onClick={stopSpeaking} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all" title="Stop Speaking">
                        <VolumeX className="w-4 h-4 text-white" />
                      </button>
                    )}
                    <button onClick={clearHistory} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all" title="Clear History" disabled={messages.length === 0}>
                      <Loader2 className="w-4 h-4 text-white" style={{ opacity: messages.length === 0 ? 0.3 : 1 }} />
                    </button>
                    <button onClick={closeModal} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all" title="Close AI">
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
                  {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center gap-6">
                      <div className="w-20 h-20 bg-violet-600/20 rounded-[2rem] flex items-center justify-center border border-violet-500/30">
                        <Bot className="w-10 h-10 text-violet-400" />
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-white mb-2">Hello, {user.name.split(' ')[0]}!</h4>
                        <p className="text-slate-400 text-sm font-medium px-8 leading-relaxed">
                          {user.role === 'caregiver' 
                            ? "I can help you analyze patient pain trends, generate medical reports, or answer general health questions."
                            : "I'm here to help you track your recovery. Ask me about your tasks, medications, or how you're doing!"}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-3 w-full max-w-[280px]">
                        {(user.role === 'caregiver' 
                          ? ["Who has the most pain?", "Summarize today's tasks", "Explain knee recovery steps"]
                          : ["What are my meds today?", "How is my progress?", "Explain hip recovery tips"]
                        ).map(q => (
                          <button key={q} onClick={() => processQuery(q)}
                            className="bg-white/5 hover:bg-white/10 text-violet-300 text-xs font-bold py-3 px-4 rounded-2xl border border-white/10 transition-all text-left">
                            ✨ {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }}
                      className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-gradient-to-br from-violet-600 to-indigo-600'}`}>
                        {msg.role === 'user' ? <User className="w-5 h-5 text-indigo-400" /> : <Bot className="w-5 h-5 text-white" />}
                      </div>
                      <div className={`max-w-[80%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`px-5 py-3.5 rounded-3xl text-sm leading-relaxed ${
                          msg.role === 'user' ? 'bg-violet-600 text-white rounded-tr-none' : 'bg-white/10 text-slate-200 border border-white/10 rounded-tl-none'
                        }`}>
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold px-2">{msg.time}</span>
                      </div>
                    </motion.div>
                  ))}

                  {isProcessing && (
                    <div className="flex gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shrink-0">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="bg-white/5 border border-white/10 px-5 py-3.5 rounded-3xl rounded-tl-none flex items-center gap-3">
                        <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Processing...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 pt-2 shrink-0 border-t border-white/5">
                  {isListening && (
                    <div className="mb-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3 flex items-center gap-3">
                      <div className="flex gap-1 items-end h-5">
                        {[1,2,3].map(i => <motion.div key={i} animate={{ height: [4, 16, 4] }} transition={{ duration: 0.6, repeat: Infinity, delay: i*0.2 }} className="w-1 bg-rose-500 rounded-full" />)}
                      </div>
                      <span className="text-rose-400 text-sm font-bold flex-1 truncate">{transcript || 'Listening for your voice...'}</span>
                      <button onClick={toggleListening} className="text-rose-500 text-xs font-black uppercase tracking-widest">Done</button>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button onClick={toggleListening} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isListening ? 'bg-rose-500 shadow-lg shadow-rose-500/40 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}>
                      <Mic className="w-5 h-5" />
                    </button>
                    <div className="flex-1 relative">
                       <input 
                         type="text" value={textInput} onChange={e => setTextInput(e.target.value)}
                         onKeyDown={e => e.key === 'Enter' && handleSend()}
                         placeholder="Type your question..."
                         className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-all pr-12"
                       />
                       <button onClick={handleSend} disabled={!textInput.trim() || isProcessing} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-violet-400 hover:text-violet-300 disabled:opacity-30">
                         <Send className="w-5 h-5" />
                       </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-600 text-center mt-3 font-bold uppercase tracking-widest">Powered by NVIDIA Llama 3.1</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIVoiceAssistant;
