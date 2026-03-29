import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, Loader2, Bot, Volume2, VolumeX, AlertCircle, Send, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

type MicPermission = 'unknown' | 'granted' | 'denied' | 'requesting';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

const CaregiverVoiceAssistant: React.FC = () => {
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
  const transcriptRef = useRef('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Vosk state
  const [voskModel, setVoskModel] = useState<Model | null>(null);
  const [isVoskReady, setIsVoskReady] = useState(false);
  const voskRecognizerRef = useRef<KaldiRecognizer | null>(null);
  const voskAudioContextRef = useRef<AudioContext | null>(null);
  const voskProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const voskStreamRef = useRef<MediaStream | null>(null);

  // Load Vosk model on mount
  useEffect(() => {
    Model.create('/vosk-model-small-en-us-0.15').then(model => {
      setVoskModel(model);
      setIsVoskReady(true);
    });
  }, []);

  // Start Vosk recognition
  const startVoskRecognition = async () => {
    if (!voskModel) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    voskStreamRef.current = stream;
    const recognizer = new KaldiRecognizer(voskModel, 16000);
    voskRecognizerRef.current = recognizer;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    voskAudioContextRef.current = audioContext;
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    voskProcessorRef.current = processor;

    source.connect(processor);
    processor.connect(audioContext.destination);

    let lastFinal = '';
    processor.onaudioprocess = (e) => {
      recognizer.acceptWaveform(e.inputBuffer.getChannelData(0));
      const res = recognizer.result();
      if (res.text && res.text !== lastFinal) {
        setTranscript(res.text);
        transcriptRef.current = res.text;
        lastFinal = res.text;
      } else {
        const partial = recognizer.partialResult();
        if (partial.partial) {
          setTranscript(partial.partial);
        }
      }
    };
    setIsListening(true);
  };

  // Stop Vosk recognition
  const stopVoskRecognition = () => {
    voskProcessorRef.current?.disconnect();
    voskAudioContextRef.current?.close();
    voskStreamRef.current?.getTracks().forEach(track => track.stop());
    setIsListening(false);
  };

  // NVIDIA API config
  const apiKey = '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';
  const NVIDIA_API_URL = '/api/nvidia/chat/completions';

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  if (user?.role !== 'caregiver') return null;

  const buildContext = () => patients.map(p => {
    const pCheckIns = checkIns.filter(c => c.patientId === p.id).slice(0, 5);
    const pTasks = tasks.filter(t => t.patientId === p.id);
    const latestCI = pCheckIns[0];
    return `Patient: ${p.name} (ID:${p.id}) | Age:${p.age} | Diagnosis:${p.diagnosis} | Doctor:${p.doctorName}
Tasks: ${pTasks.filter(t => t.completed).length}/${pTasks.length} done today
Latest check-in: ${latestCI ? `pain:${latestCI.pain}/10, mood:${latestCI.mood}, temp:${latestCI.temperature.toFixed(1)}°F, wound:${latestCI.woundStatus}, symptoms:[${latestCI.symptoms.join(',')||'none'}], alert:${latestCI.alertLevel}` : 'none'}`;
  }).join('\n---\n');

  const generateLocalReport = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    // Find matching patient(s)
    const matchedPatients = patients.filter(p => p.name.toLowerCase().split(' ').some(part => lowerQuery.includes(part)) || lowerQuery.includes(p.name.toLowerCase()));
    const targets = matchedPatients.length > 0 ? matchedPatients : patients;

    // Intents
    const isReport = /(report|save|log|note|generate)/.test(lowerQuery);
    const isPain = /(pain|hurt|ache|sore|uncomfortable)/.test(lowerQuery);
    const isStatus = /(status|alert|urgent|monitor|stable|condition|doing)/.test(lowerQuery);
    const isTasks = /(task|todo|meds|medication|done|completion|progress)/.test(lowerQuery);

    // Specific Questions
    if (lowerQuery.includes('highest pain') || lowerQuery.includes('most pain') || lowerQuery.includes('worst pain')) {
      const highestPainPatient = [...patients].sort((a,b) => {
        const p1 = checkIns.filter(c => c.patientId === b.id)[0]?.pain || 0;
        const p2 = checkIns.filter(c => c.patientId === a.id)[0]?.pain || 0;
        return p1 - p2;
      })[0];
      if (highestPainPatient) {
        const pain = checkIns.filter(c => c.patientId === highestPainPatient.id)[0]?.pain || 0;
        return `${highestPainPatient.name} currently has the highest reported pain level at ${pain}/10.`;
      }
    }

    if (lowerQuery.includes('how many') || lowerQuery.includes('total patients')) {
       return `You are currently monitoring ${patients.length} patients and there are ${checkIns.length} check-in logs recorded.`;
    }

    // Specific Patient Analysis (1 Target)
    if (targets.length === 1 && matchedPatients.length === 1) {
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

      if (isReport) {
         response += `\n[PATIENT_ID: ${p.id}]`;
      }
      return response;
    }

    // Multiple Patients Overview
    if (isPain) {
      return targets.map(p => {
        const latestInfo = checkIns.filter(c => c.patientId === p.id)[0];
        return `• ${p.name}: ${latestInfo ? `${latestInfo.pain}/10 pain` : 'No data'}`;
      }).join('\n');
    }
    
    if (isStatus) {
      return targets.map(p => {
         const latestInfo = checkIns.filter(c => c.patientId === p.id)[0];
         return `• ${p.name}: ${latestInfo ? latestInfo.alertLevel : 'No data'}`;
      }).join('\n');
    }

    if (isReport && matchedPatients.length > 1) {
      return `Please specify which patient you would like to generate a report for. I see: ${matchedPatients.map(p=>p.name).join(', ')}.`;
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
      const systemPrompt = `You are a highly capable AI medical assistant for caregivers on RecoverAI. You have access to the following local patient data.
You MUST answer ANY general, conversational, or off-topic question the user asks you naturally, just like a standard GPT model. 
If the user asks about the patients below, use the data provided. Be brief and professional. If asked to generate/save a report, include [PATIENT_ID: X] in your response.

Patient Data:
${buildContext()}`;

      if (!apiKey) {
        throw new Error('No API key found. Falling back to local offline mode.');
      }

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
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: text }
          ],
          max_tokens: 300,
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

      if (idMatch?.[1]) {
        const pId = parseInt(idMatch[1]);
        addCaregiverNote({ patientId: pId, caregiverId: user.id || 1, date: new Date().toISOString(), content: `AI Report: ${cleanText}`, tags: ['AI-Report'] });
        toast.success('Report saved to patient notes!');
      }

      speak(cleanText);
    } catch (error: any) {
      console.error('AI Processing:', error.message);
      const isAuthError = error.message.includes('401') || error.message.includes('API key');
      const fallback = generateLocalReport(text);
      
      const idMatch = fallback.match(/\[PATIENT_ID:\s*(\d+)\]/);
      let displayMsg = fallback;
      
      if (idMatch?.[1]) {
        const pId = parseInt(idMatch[1]);
        const cleanText = fallback.replace(/\[PATIENT_ID:\s*\d+\]/g, '').trim();
        displayMsg = `Report generated and saved to ${patients.find(p=>p.id===pId)?.name || 'patient'}'s medical file successfully.\n\n${cleanText}`;
        addCaregiverNote({ patientId: pId, caregiverId: user.id || 1, date: new Date().toISOString(), content: `Local AI Report: ${cleanText}`, tags: ['AI-Report'] });
        toast.success('Offline report saved!');
      } else if (!fallback || text.toLowerCase().includes('hello') || text.toLowerCase().includes('hi')) {
         displayMsg = isAuthError ? "I am running in offline mode. I can analyze local patient data safely, but my cloud connection is currently blocked." 
                                  : "I am having trouble answering that locally. Cloud features are currently offline.";
      } else {
         displayMsg = `(Offline Analytics) Here is the requested data:\n\n${fallback}`;
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
      u.rate = 1.0;
      u.pitch = 1.0;
      // Prefer a natural English voice
      const preferred = voices.find(v => v.lang.startsWith('en') && !v.localService === false)
        || voices.find(v => v.lang.startsWith('en'))
        || voices[0];
      if (preferred) u.voice = preferred;
      u.onstart = () => setIsSpeaking(true);
      u.onend = () => setIsSpeaking(false);
      u.onerror = () => setIsSpeaking(false);
      // Chrome bug: needs resume() if paused
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(u);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      doSpeak();
    } else {
      // Wait for voices to load (first time)
      window.speechSynthesis.addEventListener('voiceschanged', doSpeak, { once: true });
    }
  };

  const stopSpeaking = () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); setIsSpeaking(false); };

  const initAndStartListening = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      toast.error('Speech recognition not supported in this browser.'); return;
    }
    try {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SR();
      rec.continuous = true; // Use continuous mode for better result handling
      rec.interimResults = true;
      rec.lang = 'en-US';
      rec.onresult = (e: any) => {
        let fullFinal = '';
        let fullInterim = '';
        for (let i = 0; i < e.results.length; i++) {
          const transcriptSegment = e.results[i][0].transcript;
          if (e.results[i].isFinal) {
            fullFinal += transcriptSegment;
          } else {
            fullInterim += transcriptSegment;
          }
        }
        const fullDisplay = (fullFinal + fullInterim).trim();
        console.log('Speech onresult:', { fullFinal, fullInterim, fullDisplay });
        setTranscript(fullDisplay);
        transcriptRef.current = fullFinal.trim();
      };
      rec.onerror = (e: any) => {
        setIsListening(false);
        console.error('SpeechRecognition error:', e);
        if (e.error === 'not-allowed') {
          setMicPermission('denied');
          toast.error('Mic denied.');
        }
      };
      rec.onend = () => {
        setIsListening(false);
        console.log('SpeechRecognition ended');
      };
      recognitionRef.current = rec;
      rec.start();
      setTranscript('');
      transcriptRef.current = '';
      setIsListening(true);
    } catch (e) {
      console.error(e);
      toast.error('Could not start mic.');
    }
  };

  const toggleListening = async () => {
    if (isListening) {
      try { recognitionRef.current?.stop(); } catch (_) {}
      setIsListening(false);
      let finalTranscript = transcriptRef.current || transcript;
      finalTranscript = deduplicateWords(finalTranscript.trim());
      if (finalTranscript) {
        setTextInput('');
        processQuery(finalTranscript);
        setTranscript('');
        transcriptRef.current = '';
      }
      return;
    }
    if (micPermission === 'denied') { toast.error('Mic is blocked. Use text input.'); return; }
    if (micPermission !== 'granted') {
      setMicPermission('requesting');
      try { await navigator.mediaDevices.getUserMedia({ audio: true }); setMicPermission('granted'); initAndStartListening(); }
      catch { setMicPermission('denied'); toast.error('Mic access denied.'); }
    } else { initAndStartListening(); }
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

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-[9000] w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full shadow-2xl shadow-violet-500/50 flex items-center justify-center border-2 border-white/20"
        aria-label="AI Assistant"
      >
        <Bot className="w-7 h-7 text-white" />
        {messages.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#0a0a1a] flex items-center justify-center text-xs text-white font-bold">
            {messages.filter(m => m.role === 'assistant').length}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal} className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9001]" />

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              className="fixed inset-x-4 bottom-4 top-[5%] sm:inset-auto sm:right-6 sm:bottom-6 sm:w-[420px] sm:h-[650px] z-[9002] flex flex-col"
            >
              <div className="glass-card-static rounded-[2rem] flex flex-col h-full overflow-hidden border border-white/15" style={{ background: 'rgba(15,12,41,0.92)', backdropFilter: 'blur(32px)' }}>
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 flex items-center justify-between shrink-0 rounded-t-[2rem]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg leading-tight">AI Medical Assistant</h3>
                      <p className="text-violet-200 text-xs">Ask anything about your patients</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSpeaking && (
                      <button onClick={stopSpeaking} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all" title="Stop Speaking">
                        <VolumeX className="w-4 h-4 text-white" />
                      </button>
                    )}
                    <button onClick={closeModal} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all" title="Close AI">
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Mic denied warning */}
                {micPermission === 'denied' && (
                  <div className="flex items-start gap-2 mx-4 mt-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl shrink-0">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-rose-300">Mic blocked — allow access in browser settings, then refresh.</p>
                  </div>
                )}

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                  {messages.length === 0 && !isProcessing && (
                    <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-8">
                      <div className="w-16 h-16 bg-violet-500/20 rounded-2xl flex items-center justify-center border border-violet-500/30">
                        <Bot className="w-8 h-8 text-violet-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white mb-1">How can I help you?</p>
                        <p className="text-xs text-slate-400 max-w-[260px]">Try: "What's Krrish's current pain level?" or "Generate a report for patient 2"</p>
                      </div>
                      <div className="grid grid-cols-1 gap-2 w-full max-w-xs mt-2">
                        {["Summarize all patients", "Who has the highest pain?", "Generate report for Krrish"].map(q => (
                          <button key={q} onClick={() => processQuery(q)}
                            className="text-left px-4 py-2.5 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 text-xs font-medium rounded-xl border border-violet-500/20 transition-all">
                            💬 {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-500/30 border border-indigo-500/40' : 'bg-gradient-to-br from-violet-500 to-indigo-600'}`}>
                        {msg.role === 'user' ? <User className="w-4 h-4 text-indigo-300" /> : <Bot className="w-4 h-4 text-white" />}
                      </div>
                      <div className={`max-w-[78%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-sm'
                            : 'bg-white/8 border border-white/10 text-slate-200 rounded-tl-sm'
                        }`}>
                          {msg.content}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">{msg.time}</span>
                          {msg.role === 'assistant' && (
                            <button onClick={() => speak(msg.content)} className="text-slate-500 hover:text-violet-400 transition-colors">
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white/8 border border-white/10 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                        <span className="text-sm text-slate-400">Analyzing patient data...</span>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Listening indicator */}
                {isListening && (
                  <div className="px-4 pb-2 shrink-0">
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2 flex items-center gap-2">
                      <div className="flex gap-0.5 items-end h-4">
                        {[1,2,3,4,5].map(i => (
                          <motion.div key={i} animate={{ height: [4, 12, 4] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                            className="w-1 bg-rose-400 rounded-full" />
                        ))}
                      </div>
                      <span className="text-rose-300 text-sm font-medium flex-1">
                        {transcript || 'Listening...'}
                      </span>
                      <button onClick={toggleListening} className="text-rose-400 hover:text-rose-200 text-xs font-semibold">Stop</button>
                    </div>
                  </div>
                )}

                {/* Input area */}
                <div className="px-4 pb-4 pt-2 shrink-0 border-t border-white/8">
                  <div className="flex items-end gap-2">
                    <button
                      onClick={isListening ? stopVoskRecognition : startVoskRecognition}
                      title={micPermission === 'denied' ? 'Mic blocked' : isListening ? 'Stop' : 'Speak'}
                      className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-md ${
                        micPermission === 'denied' ? 'bg-white/10 text-slate-500 cursor-not-allowed'
                          : isListening ? 'bg-rose-500 text-white shadow-rose-400/40 animate-pulse'
                          : 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-violet-500/40'
                      }`}
                    >
                      {micPermission === 'denied' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>

                    <textarea
                      value={textInput}
                      onChange={e => setTextInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      placeholder="Type a question or use the mic..."
                      rows={1}
                      className="flex-1 px-4 py-2.5 bg-white/6 border border-white/12 rounded-xl text-sm text-white placeholder-slate-500 focus:border-violet-400 focus:bg-white/10 transition-all outline-none resize-none"
                      style={{ maxHeight: '80px' }}
                    />

                    <button
                      onClick={handleSend}
                      disabled={!textInput.trim() || isProcessing}
                      className="shrink-0 w-11 h-11 bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-xl flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-all shadow-md shadow-violet-500/30"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 text-center mt-2">Powered by NVIDIA Llama-3.1 · Enter to send</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CaregiverVoiceAssistant;

