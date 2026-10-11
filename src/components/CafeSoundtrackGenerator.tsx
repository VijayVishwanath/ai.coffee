import React, { useState, useRef } from 'react';
import { 
  Music, 
  Sparkles, 
  Play, 
  Pause, 
  Download, 
  RefreshCw, 
  Volume2, 
  Radio, 
  Clock, 
  Headphones,
  Sliders,
  CheckCircle2
} from 'lucide-react';

interface CafeSoundtrackGeneratorProps {
  currentRoomVibe?: string;
}

const PRESET_ATMOSPHERES = [
  {
    title: 'Rainy Afternoon Jazz & Nylon Guitar',
    prompt: 'Warm acoustic nylon guitar, soft brushed snare, and mellow Rhodes electric piano for a rainy coffee shop afternoon',
    genre: 'Acoustic Jazz',
    bpm: '72 BPM',
  },
  {
    title: 'Lo-Fi Chillhop Study Session',
    prompt: 'Mellow lo-fi hip hop beat with warm tape saturation, dusty jazz piano sample, and ambient coffee grinder hum',
    genre: 'Lo-Fi Chillhop',
    bpm: '80 BPM',
  },
  {
    title: 'Bossa Nova Espresso Sunrise',
    prompt: 'Gentle Brazilian bossa nova acoustic guitar with soft shaker rhythm and warm double bass',
    genre: 'Bossa Nova',
    bpm: '88 BPM',
  },
  {
    title: 'Minimalist Neo-Classical Focus',
    prompt: 'Ambient felted upright piano chords with subtle cello drone, serene and spacious for deep reading',
    genre: 'Neo-Classical',
    bpm: '65 BPM',
  },
];

export const CafeSoundtrackGenerator: React.FC<CafeSoundtrackGeneratorProps> = ({
  currentRoomVibe = 'Productive & Focused',
}) => {
  const [prompt, setPrompt] = useState(PRESET_ATMOSPHERES[0].prompt);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackMetadata, setTrackMetadata] = useState<{
    lyrics?: string;
    prompt?: string;
  } | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGenerateMusic = async (customPrompt?: string) => {
    const textPrompt = customPrompt || prompt;
    if (!textPrompt.trim() || isGenerating) return;

    setIsGenerating(true);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    try {
      const response = await fetch('/api/music/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textPrompt }),
      });

      if (!response.ok) throw new Error('Music generation failed');
      const data = await response.json();

      if (data.audioBase64) {
        // Decode base64 to Blob URL
        const binaryString = atob(data.audioBase64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: data.mimeType || 'audio/wav' });
        const audioUrl = URL.createObjectURL(blob);
        setGeneratedAudioUrl(audioUrl);
        setTrackMetadata({
          lyrics: data.lyrics || 'Artisan Café Instrumental Suite',
          prompt: textPrompt,
        });
      }
    } catch (err) {
      console.error(err);
      alert('Could not generate track. Using cached ambient audio.');
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Music className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-purple-400">
              Vertex AI Lyria Music Generator
            </span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-100 tracking-tight mt-1">
            Café Ambient Soundtrack Generator
          </h2>
          <p className="text-xs sm:text-sm text-stone-400">
            Compose original 30-second soundtrack clips using Google's <span className="font-mono text-purple-300">lyria-3-clip-preview</span> model tailored to the café room pulse.
          </p>
        </div>

        <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 shrink-0">
          <Headphones className="w-3.5 h-3.5" />
          Room Vibe: {currentRoomVibe}
        </span>
      </div>

      {/* Preset Atmosphere Cards */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-stone-300 uppercase tracking-wider block">
          Curated Soundscapes for Coffee & Study:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_ATMOSPHERES.map((preset, idx) => {
            const isSelected = selectedPreset === idx;
            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedPreset(idx);
                  setPrompt(preset.prompt);
                }}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-purple-950/30 border-purple-500 text-purple-200 shadow-md ring-1 ring-purple-500/50'
                    : 'bg-stone-950/70 border-stone-800 hover:border-stone-700 text-stone-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 mb-1">
                  <span>{preset.genre}</span>
                  <span className="text-purple-400">{preset.bpm}</span>
                </div>
                <h4 className="font-bold font-serif text-sm text-stone-100">{preset.title}</h4>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Prompt & Generation Action */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-stone-300 block">
          Custom Music Composition Prompt:
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. 'Warm acoustic jazz guitar with soft rain and vintage vinyl crackle'"
            className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-purple-500"
          />

          <button
            onClick={() => handleGenerateMusic()}
            disabled={isGenerating || !prompt.trim()}
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/30 shrink-0"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                <span>Generating with Lyria AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Soundscape Track</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Audio Player & Playback Showcase */}
      {generatedAudioUrl && (
        <div className="bg-stone-950/80 border border-purple-500/30 rounded-2xl p-5 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between flex-wrap gap-3 border-b border-stone-800 pb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg transition-all"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <div>
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider block">
                  Now Playing Track
                </span>
                <h4 className="font-bold text-stone-100 font-serif text-sm">
                  {PRESET_ATMOSPHERES[selectedPreset]?.title || 'Custom Ambient Composition'}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <audio
                ref={audioRef}
                src={generatedAudioUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />

              <a
                href={generatedAudioUrl}
                download="cafe-ambient-track.wav"
                className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Download WAV
              </a>
            </div>
          </div>

          {/* Animated Waveform Bars */}
          <div className="flex items-center justify-between gap-1 h-12 px-2 bg-stone-900 rounded-xl overflow-hidden">
            {Array.from({ length: 36 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: isPlaying
                    ? `${20 + Math.sin(i * 0.5) * 15 + Math.random() * 25}%`
                    : '25%',
                }}
                className={`w-full rounded-full transition-all duration-150 ${
                  isPlaying ? 'bg-purple-500' : 'bg-stone-700'
                }`}
              />
            ))}
          </div>

          <div className="text-[11px] text-stone-400 italic">
            Prompt: "{trackMetadata?.prompt}"
          </div>
        </div>
      )}
    </div>
  );
};
