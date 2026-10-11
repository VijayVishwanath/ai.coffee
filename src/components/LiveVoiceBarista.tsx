import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Radio, 
  RefreshCw, 
  X, 
  Coffee, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';

interface LiveVoiceBaristaProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TranscriptTurn {
  sender: 'user' | 'aura';
  text: string;
  time: string;
}

export const LiveVoiceBarista: React.FC<LiveVoiceBaristaProps> = ({
  isOpen,
  onClose,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptTurn[]>([
    {
      sender: 'aura',
      text: "Hello! I'm Aura, your live voice barista powered by Gemini 3.8 Live. Speak directly to me or tap a prompt to start our conversation.",
      time: 'Just now',
    },
  ]);
  const [liveVolume, setLiveVolume] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  // Initialize WebSocket connection when modal opens
  useEffect(() => {
    if (!isOpen) {
      handleStopVoice();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/live`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to Live API WebSocket');
      setIsConnected(true);
    };

    ws.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.text) {
          setTranscripts((prev) => [
            ...prev,
            {
              sender: 'aura',
              text: msg.text,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }

        if (msg.audio && !isMuted) {
          playPcmAudio(msg.audio);
        }
      } catch (err) {
        console.error('Error parsing live WS response:', err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      ws.close();
      handleStopVoice();
    };
  }, [isOpen]);

  // Play 24kHz raw PCM Audio chunk
  const playPcmAudio = (base64Data: string) => {
    try {
      if (!outputAudioCtxRef.current) {
        // Output at 24000Hz as standard for Gemini 3.8 Live
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        outputAudioCtxRef.current = new AudioCtx({ sampleRate: 24000 });
      }

      const audioCtx = outputAudioCtxRef.current;
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Int16Array(len / 2);

      for (let i = 0; i < len; i += 2) {
        const lo = binaryString.charCodeAt(i);
        const hi = binaryString.charCodeAt(i + 1);
        bytes[i / 2] = (hi << 8) | lo;
      }

      const float32 = new Float32Array(bytes.length);
      for (let i = 0; i < bytes.length; i++) {
        float32[i] = bytes[i] / 32768.0;
      }

      const buffer = audioCtx.createBuffer(1, float32.length, 24000);
      buffer.copyToChannel(float32, 0);

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.start();
    } catch (e) {
      console.warn('Playback error:', e);
    }
  };

  const handleStartVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioCtx({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputCtx;

      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += Math.abs(inputData[i]);
        }
        setLiveVolume(Math.min(100, Math.round((sum / inputData.length) * 400)));

        // Convert Float32 to 16-bit PCM LE
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        // Base64 encode
        let binary = '';
        const bytes = new Uint8Array(pcm16.buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Audio = btoa(binary);

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ audio: base64Audio }));
        }
      };

      source.connect(processor);
      processor.connect(inputCtx.destination);
      setIsRecording(true);
    } catch (err) {
      console.warn('Microphone access denied or error:', err);
      alert('Microphone permission required for real-time live voice. You can also use quick prompt buttons below!');
    }
  };

  const handleStopVoice = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }
    setIsRecording(false);
    setLiveVolume(0);
  };

  const sendTextPrompt = (text: string) => {
    setTranscripts((prev) => [
      ...prev,
      {
        sender: 'user',
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-amber-500/40 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-serif font-bold text-stone-100">
                  Gemini 3.8 Live Voice Barista
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                  Live API
                </span>
              </div>
              <p className="text-xs text-stone-400">Natural voice conversation with zero perceptible latency</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-xl bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Audio Visualizer Orb */}
        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <div className="relative">
            {/* Pulsing rings */}
            <div
              style={{ transform: `scale(${1 + (liveVolume / 100) * 0.4})` }}
              className={`w-28 h-28 rounded-full flex items-center justify-center transition-transform duration-75 shadow-2xl ${
                isRecording
                  ? 'bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 ring-8 ring-amber-500/20 shadow-amber-500/30'
                  : 'bg-stone-800 border border-stone-700'
              }`}
            >
              <Coffee className={`w-12 h-12 ${isRecording ? 'text-stone-950 animate-pulse' : 'text-stone-400'}`} />
            </div>
            {isRecording && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-stone-950 border border-amber-500 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap">
                Listening (16kHz PCM)...
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            {!isRecording ? (
              <button
                onClick={handleStartVoice}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
              >
                <Mic className="w-4 h-4" />
                Start Voice Conversation
              </button>
            ) : (
              <button
                onClick={handleStopVoice}
                className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-rose-600/20"
              >
                <MicOff className="w-4 h-4" />
                Stop Microphone
              </button>
            )}

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-all"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Live Conversation Transcript Stream */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider block">
            Real-Time Voice Turns
          </span>
          <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 max-h-44 overflow-y-auto space-y-2.5 scrollbar-thin">
            {transcripts.map((t, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${t.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                    t.sender === 'user'
                      ? 'bg-amber-600 text-stone-950 font-medium rounded-tr-none'
                      : 'bg-stone-850 text-stone-200 border border-stone-700/60 rounded-tl-none'
                  }`}
                >
                  {t.text}
                </div>
                <span className="text-[9px] text-stone-500 mt-0.5 px-1 font-mono">{t.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Voice Prompt Starters */}
        <div className="space-y-2 pt-1 border-t border-stone-800">
          <span className="text-[11px] font-mono text-stone-400 block">Or tap a quick barista question:</span>
          <div className="flex flex-wrap gap-2">
            {[
              "What's your lightest floral pour-over?",
              "Recommend a breakfast pairing for an oat flat white",
              "Which drink has the highest caffeine for deep coding?",
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => sendTextPrompt(prompt)}
                className="text-xs bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white px-3 py-1.5 rounded-xl border border-stone-700 transition-all text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
