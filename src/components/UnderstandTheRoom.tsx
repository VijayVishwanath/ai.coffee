import React, { useState } from 'react';
import { 
  Activity, 
  Volume2, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  Music, 
  Smile, 
  Meh, 
  Frown, 
  Send, 
  BellRing,
  Coffee,
  Check,
  TrendingUp,
  BarChart2,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { RoomPulseData } from '../types/cafe';

interface UnderstandTheRoomProps {
  roomPulse: RoomPulseData;
  onUpdatePulse: (pulse: RoomPulseData) => void;
}

interface SentimentDataPoint {
  time: string;
  minutesAgo: string;
  score: number; // 0 to 100%
  vibe: string;
  feedbackVolume: number;
}

export const UnderstandTheRoom: React.FC<UnderstandTheRoomProps> = ({
  roomPulse,
  onUpdatePulse,
}) => {
  const [guestFeedback, setGuestFeedback] = useState('');
  const [ambientDb, setAmbientDb] = useState(roomPulse.ambientDecibels || 64);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('All Zones');
  
  // Real-time 60-minute sentiment timeline data for the cafe manager
  const [sentimentTrend, setSentimentTrend] = useState<SentimentDataPoint[]>([
    { time: '09:30', minutesAgo: '60m ago', score: 78, vibe: 'Morning Rush Opening', feedbackVolume: 8 },
    { time: '09:40', minutesAgo: '50m ago', score: 81, vibe: 'Steady Commute', feedbackVolume: 14 },
    { time: '09:50', minutesAgo: '40m ago', score: 76, vibe: 'Music Too Loud (Resolved)', feedbackVolume: 19 },
    { time: '10:00', minutesAgo: '30m ago', score: 84, vibe: 'Playlist Temp Adjusted', feedbackVolume: 12 },
    { time: '10:10', minutesAgo: '20m ago', score: 89, vibe: 'Optimal Pour-Over Bloom', feedbackVolume: 16 },
    { time: '10:20', minutesAgo: '10m ago', score: 92, vibe: 'Deep Focus & Calm', feedbackVolume: 11 },
    { time: 'Now', minutesAgo: 'Current', score: Math.round(roomPulse.sentimentScore * 100), vibe: roomPulse.vibe, feedbackVolume: 7 },
  ]);

  const [recentFeedbacks, setRecentFeedbacks] = useState<Array<{ text: string; sentiment: number; time: string }>>([
    { text: 'The natural light and background jazz playlist are perfect for deep work today.', sentiment: 0.92, time: '10:05 AM' },
    { text: 'Ethiopian V60 has incredible peach aromatics! But please check the draft near table 8.', sentiment: 0.74, time: '09:48 AM' },
  ]);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<string[]>([]);

  const handleAnalyzeSentiment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestFeedback.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    const feedbackText = guestFeedback;
    setGuestFeedback('');

    try {
      const response = await fetch('/api/sentiment/room-pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerFeedback: feedbackText,
          ambientDecibels: ambientDb,
          queueDepth: 5,
        }),
      });

      if (!response.ok) throw new Error('Failed to analyze');
      const data = await response.json();

      const newScore = data.sentimentScore !== undefined ? data.sentimentScore : 0.88;
      const newScorePercent = Math.round(newScore * 100);

      const updatedPulse: RoomPulseData = {
        vibe: data.vibe || 'Productive & Focused',
        sentimentScore: newScore,
        crowdDensity: data.crowdDensity || 'Moderate',
        acousticComfort: data.acousticComfort || `${ambientDb} dB`,
        ambientDecibels: ambientDb,
        baristaAlerts: data.baristaAlerts || roomPulse.baristaAlerts,
        musicSuggestion: data.musicSuggestion || 'Lo-fi instrumental / warm jazz',
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      onUpdatePulse(updatedPulse);
      setRecentFeedbacks((prev) => [
        { text: feedbackText, sentiment: newScore, time: 'Just now' },
        ...prev,
      ]);

      // Update real-time sentiment trend graph for the manager
      setSentimentTrend((prev) => {
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const updated = [...prev];
        // Shift previous "Now" to a timed timestamp and push current live point
        if (updated.length > 0) {
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            time: nowTime,
            minutesAgo: '1m ago',
          };
        }
        updated.push({
          time: 'Now',
          minutesAgo: 'Live',
          score: newScorePercent,
          vibe: updatedPulse.vibe,
          feedbackVolume: 1,
        });
        return updated.slice(-8); // Keep last 8 data points
      });
    } catch (err) {
      console.error(err);
      setRecentFeedbacks((prev) => [
        { text: feedbackText, sentiment: 0.8, time: 'Just now' },
        ...prev,
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAcknowledgeAlert = (alertText: string) => {
    setAcknowledgedAlerts((prev) => [...prev, alertText]);
  };

  const getSentimentIcon = (score: number) => {
    if (score >= 0.7) return <Smile className="w-4 h-4 text-emerald-400" />;
    if (score >= 0.3) return <Meh className="w-4 h-4 text-amber-400" />;
    return <Frown className="w-4 h-4 text-rose-400" />;
  };

  // Compute 60-min trend metrics for the cafe manager
  const avgSentiment = Math.round(
    sentimentTrend.reduce((acc, curr) => acc + curr.score, 0) / sentimentTrend.length
  );
  const minSentiment = Math.min(...sentimentTrend.map((d) => d.score));
  const maxSentiment = Math.max(...sentimentTrend.map((d) => d.score));
  const currentLiveScore = sentimentTrend[sentimentTrend.length - 1]?.score || 88;
  const initialScore = sentimentTrend[0]?.score || 78;
  const deltaScore = currentLiveScore - initialScore;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Activity className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400">
              Room Intelligence & Sentiment
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 tracking-tight mt-1">
            Understand the Room
          </h1>
          <p className="text-xs sm:text-sm text-stone-400">
            Real-time acoustics, guest sentiment telemetry, and 60-minute manager pulse trends empowering café teams to respond proactively.
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono text-stone-500 block">Telemetry Stream</span>
          <span className="text-xs font-mono font-semibold text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Sensors Active (Updated {roomPulse.lastUpdated})
          </span>
        </div>
      </div>

      {/* KPI Cards: Acoustic & Vibe Sensor Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Vibe */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Room Vibe Classification</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-serif text-amber-300">
            {roomPulse.vibe}
          </div>
          <p className="text-[11px] text-stone-400">Harmonious ambient environment</p>
        </div>

        {/* Ambient Noise */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Acoustic Decibel Sensor</span>
            <Volume2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-stone-100">
            {ambientDb} dB
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="50"
              max="85"
              value={ambientDb}
              onChange={(e) => setAmbientDb(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            />
          </div>
          <span className="text-[10px] text-stone-500 block">
            {ambientDb <= 66 ? 'Optimal 60-66 dB for deep work' : 'Elevated buzz - consider pacing playlist'}
          </span>
        </div>

        {/* Sentiment Index */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Guest Sentiment Index</span>
            {getSentimentIcon(roomPulse.sentimentScore)}
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            +{(roomPulse.sentimentScore * 100).toFixed(0)}% Positive
          </div>
          <p className="text-[11px] text-stone-400">Aggregated from live feedback & reviews</p>
        </div>

        {/* Adaptive Music */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Dynamic Acoustic Playlist</span>
            <Music className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm font-semibold text-stone-200 truncate">
            {roomPulse.musicSuggestion}
          </div>
          <p className="text-[11px] text-stone-500">Auto-tuned to ambient room cadence</p>
        </div>
      </div>

      {/* RECHARTS SENTIMENT SCORE 60-MINUTE TREND GRAPH FOR CAFE MANAGER */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Manager Header & Granularity Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <TrendingUp className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                Café Manager Telemetry Console
              </span>
            </div>
            <h2 className="text-xl font-serif font-bold text-stone-100 flex items-center gap-2">
              Sentiment Score Trends (Last 60 Minutes)
            </h2>
            <p className="text-xs text-stone-400">
              Continuous rolling telemetry stream tracking ambient room satisfaction, music pacing, and barista interventions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {['All Zones', 'Quiet Studio', 'Sunlit Bay', 'Communal Oak'].map((zone) => (
              <button
                key={zone}
                onClick={() => setSelectedZoneFilter(zone)}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
                  selectedZoneFilter === zone
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                    : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
                }`}
              >
                {zone}
              </button>
            ))}
          </div>
        </div>

        {/* Manager Metric Strips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-950/60 border border-stone-800/80 rounded-2xl p-4 text-xs font-mono">
          <div>
            <span className="text-stone-500 text-[10px] uppercase block">60-Min Mean Score</span>
            <span className="text-lg font-bold text-stone-100">{avgSentiment}%</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">SLA Target &gt; 75%</span>
          </div>

          <div>
            <span className="text-stone-500 text-[10px] uppercase block">Hourly Trajectory</span>
            <span className={`text-lg font-bold flex items-center gap-1 ${
              deltaScore >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {deltaScore >= 0 ? `+${deltaScore}%` : `${deltaScore}%`}
            </span>
            <span className="text-[10px] text-stone-400 block mt-0.5">vs. 60m baseline</span>
          </div>

          <div>
            <span className="text-stone-500 text-[10px] uppercase block">Peak Satisfaction</span>
            <span className="text-lg font-bold text-amber-400">{maxSentiment}%</span>
            <span className="text-[10px] text-stone-400 block mt-0.5">Single-origin showcase</span>
          </div>

          <div>
            <span className="text-stone-500 text-[10px] uppercase block">Lowest Dip Paced</span>
            <span className="text-lg font-bold text-cyan-400">{minSentiment}%</span>
            <span className="text-[10px] text-stone-400 block mt-0.5">Auto-mitigated in 4m</span>
          </div>
        </div>

        {/* Recharts Area Chart Container */}
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sentimentTrend} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="amberAccent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />

              <XAxis 
                dataKey="time" 
                stroke="#78716c" 
                tick={{ fill: '#a8a29e', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#44403c' }}
                axisLine={{ stroke: '#44403c' }}
              />

              <YAxis 
                domain={[50, 100]} 
                ticks={[50, 65, 75, 85, 100]}
                unit="%"
                stroke="#78716c"
                tick={{ fill: '#a8a29e', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#44403c' }}
                axisLine={{ stroke: '#44403c' }}
              />

              {/* SLA Target Reference Line at 75% */}
              <ReferenceLine 
                y={75} 
                stroke="#f59e0b" 
                strokeDasharray="4 4" 
                label={{ 
                  value: 'Manager Target SLA (75%)', 
                  fill: '#f59e0b', 
                  fontSize: 10, 
                  position: 'insideBottomRight' 
                }} 
              />

              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as SentimentDataPoint;
                    return (
                      <div className="bg-stone-950 border border-stone-700/80 rounded-xl p-3 shadow-2xl text-xs space-y-1.5 backdrop-blur-md">
                        <div className="flex items-center justify-between gap-3 border-b border-stone-800 pb-1">
                          <span className="font-mono text-stone-400 font-bold">{data.time} ({data.minutesAgo})</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                            Score: {data.score}%
                          </span>
                        </div>
                        <div className="text-stone-300 font-medium">
                          Context: <span className="text-amber-300">{data.vibe}</span>
                        </div>
                        <div className="text-[10px] text-stone-500 font-mono">
                          Live Feedback Inputs: {data.feedbackVolume} guest tokens
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#10b981" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#sentimentGradient)" 
                activeDot={{ r: 6, fill: '#10b981', stroke: '#064e3b', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Explanatory Legend for the Manager */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400 pt-2 border-t border-stone-800/80 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Live Sentiment Score Curve</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-500"></span>
              <span>Target SLA Benchmark (75%)</span>
            </span>
          </div>

          <div className="text-[11px] text-stone-500">
            Telemetry Provider: Google Cloud Monitoring & Eventarc
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Proactive Barista Copilot Alerts */}
        <div className="lg:col-span-7 bg-stone-900/80 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-amber-400 animate-pulse" />
              <h2 className="text-lg font-serif font-bold text-stone-100">
                Proactive Barista Copilot Alerts
              </h2>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
              Auto-Dispatched via Pub/Sub
            </span>
          </div>

          <p className="text-xs text-stone-400">
            Gemini AI continuously synthesizes IoT acoustics, order depletion velocities, and guest sentiment to generate preemptive interventions for the café team.
          </p>

          <div className="space-y-3">
            {roomPulse.baristaAlerts.map((alert, idx) => {
              const isAcknowledged = acknowledgedAlerts.includes(alert);

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    isAcknowledged
                      ? 'bg-stone-950/40 border-stone-850 opacity-60'
                      : 'bg-stone-950/80 border-amber-500/30 shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <p className="text-xs font-medium text-stone-200 leading-relaxed">
                        {alert}
                      </p>
                      <span className="text-[10px] text-stone-500 font-mono mt-1 block">
                        Category: Real-time Operational Telemetry
                      </span>
                    </div>
                  </div>

                  {isAcknowledged ? (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 shrink-0 px-2 py-1 rounded bg-emerald-500/10">
                      <Check className="w-3 h-3" /> Resolved
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAcknowledgeAlert(alert)}
                      className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium shrink-0 transition-all border border-stone-700"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Guest Feedback & Sentiment Triage */}
        <div className="lg:col-span-5 bg-stone-900/80 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="border-b border-stone-800 pb-3">
            <h2 className="text-lg font-serif font-bold text-stone-100">
              Live Guest Pulse & Feedback Drop
            </h2>
            <p className="text-xs text-stone-400">
              Submit feedback to see real-time AI sentiment scoring and barista triage.
            </p>
          </div>

          <form onSubmit={handleAnalyzeSentiment} className="space-y-3">
            <textarea
              rows={3}
              value={guestFeedback}
              onChange={(e) => setGuestFeedback(e.target.value)}
              placeholder="e.g. 'The Colombian Geisha pour-over was breathtaking, but table 4 was a bit drafty.'"
              className="w-full bg-stone-950 border border-stone-700 rounded-xl p-3 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-all shadow-inner"
            />

            <button
              type="submit"
              disabled={isAnalyzing || !guestFeedback.trim()}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-stone-950 border-t-transparent animate-spin"></div>
                  <span>Analyzing Sentiment with Gemini...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit & Trigger AI Triage</span>
                </>
              )}
            </button>
          </form>

          {/* Recent Guest Feedbacks */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
              Recent Triaged Feedback:
            </span>
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
              {recentFeedbacks.map((fb, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-stone-950/70 border border-stone-850 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono">
                    <span>{fb.time}</span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      Score: {(fb.sentiment * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-stone-300 italic">"{fb.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

