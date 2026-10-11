import React, { useState } from 'react';
import { 
  Users, 
  Sparkles, 
  MessageSquare, 
  MapPin, 
  ShieldCheck, 
  Radio, 
  Send, 
  Plus, 
  UserCheck,
  Coffee,
  X
} from 'lucide-react';
import { SerendipityProfile } from '../types/cafe';

interface ConnectPeopleProps {
  patrons: SerendipityProfile[];
  onAddPatron: (patron: SerendipityProfile) => void;
}

export const ConnectPeople: React.FC<ConnectPeopleProps> = ({
  patrons,
  onAddPatron,
}) => {
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [activeChatMatch, setActiveChatMatch] = useState<{
    patron: SerendipityProfile;
    headline?: string;
    icebreaker?: string;
    suggestedTopic?: string;
    synergyScore?: number;
  } | null>(null);
  const [isMatchingLoading, setIsMatchingLoading] = useState(false);

  // My Table Presence Form State
  const [isJoining, setIsJoining] = useState(false);
  const [myName, setMyName] = useState('');
  const [myRole, setMyRole] = useState('Senior Software Engineer');
  const [myZone, setMyZone] = useState('Table 4 (Quiet Studio)');
  const [myFocus, setMyFocus] = useState('Building event-driven microservices with Google Cloud Pub/Sub & Gemini');
  const [myTopics, setMyTopics] = useState('Distributed Systems, Cloud Run, Pour-Overs');
  const [isOpenToChat, setIsOpenToChat] = useState(true);

  const filteredPatrons = patrons.filter((p) => {
    if (selectedZone === 'all') return true;
    return p.tableZone.toLowerCase().includes(selectedZone.toLowerCase());
  });

  const handleSparkConversation = async (patron: SerendipityProfile) => {
    setIsMatchingLoading(true);
    setActiveChatMatch({ patron });

    try {
      const response = await fetch('/api/connect/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileName: myName || 'Visiting Architect',
          currentFocus: myFocus || 'Cloud native systems & AI agents',
          openTopics: patron.openTopics,
          tableZone: patron.tableZone,
        }),
      });

      if (!response.ok) throw new Error('Failed to match');
      const data = await response.json();

      setActiveChatMatch({
        patron,
        headline: data.matchHeadline,
        icebreaker: data.icebreaker,
        suggestedTopic: data.suggestedTopic,
        synergyScore: data.synergyScore || 92,
      });
    } catch (e) {
      console.error(e);
      setActiveChatMatch({
        patron,
        headline: `High synergy with ${patron.tableZone}`,
        icebreaker: `Hi ${patron.name}! I saw you are focusing on ${patron.openTopics[0]}—would love to exchange thoughts if you have a coffee break.`,
        suggestedTopic: `${patron.openTopics.join(' & ')}`,
        synergyScore: 89,
      });
    } finally {
      setIsMatchingLoading(false);
    }
  };

  const handleJoinTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myName.trim()) return;

    const newPatron: SerendipityProfile = {
      id: `patron-${Date.now()}`,
      name: myName,
      avatar: '☕',
      role: myRole,
      tableZone: myZone,
      currentFocus: myFocus,
      openTopics: myTopics.split(',').map((t) => t.trim()),
      isOpenToChat,
    };

    onAddPatron(newPatron);
    setIsJoining(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Users className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400">
              The Serendipity Table
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 tracking-tight mt-1">
            Connect People & Shared Interests
          </h1>
          <p className="text-xs sm:text-sm text-stone-400">
            Opt-in community presence for remote founders, engineers, researchers, and book lovers in the room.
          </p>
        </div>

        <button
          onClick={() => setIsJoining(!isJoining)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          {isJoining ? 'Close Form' : 'Broadcast My Table Presence'}
        </button>
      </div>

      {/* Privacy Guarantee Banner */}
      <div className="bg-stone-900/60 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-stone-100 block">
              Privacy-First In-Room Socializing
            </span>
            <p className="text-[11px] text-stone-400">
              No phone numbers, emails, or social media handles are shared. All interactions are ambient, opt-in, and localized to this physical café space.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>4 Patrons Opted In</span>
        </div>
      </div>

      {/* Join Community Presence Form */}
      {isJoining && (
        <form
          onSubmit={handleJoinTable}
          className="bg-stone-900/90 border border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="text-base font-bold font-serif text-stone-100">
              Set Your Table Presence in the Café
            </h3>
            <span className="text-xs text-amber-400 font-mono">Opt-in session only</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-stone-300">Your First Name / Pseudonym:</label>
              <input
                type="text"
                required
                value={myName}
                onChange={(e) => setMyName(e.target.value)}
                placeholder="e.g. Alex M."
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-stone-300">Role / Craft:</label>
              <input
                type="text"
                value={myRole}
                onChange={(e) => setMyRole(e.target.value)}
                placeholder="e.g. Principal Cloud Architect"
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-stone-300">Table Zone:</label>
              <select
                value={myZone}
                onChange={(e) => setMyZone(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-100 focus:outline-none focus:border-amber-500"
              >
                <option value="Table 4 (Quiet Studio)">Table 4 (Quiet Studio)</option>
                <option value="Table 8 (Sunlit Bay)">Table 8 (Sunlit Bay)</option>
                <option value="Communal Oak Table">Communal Oak Table</option>
                <option value="Counter Nook 2">Counter Nook 2</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-stone-300">Open Discussion Topics (comma separated):</label>
              <input
                type="text"
                value={myTopics}
                onChange={(e) => setMyTopics(e.target.value)}
                placeholder="e.g. Distributed Systems, Pour-Overs, AI"
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-semibold text-stone-300">What are you focused on today?</label>
              <input
                type="text"
                value={myFocus}
                onChange={(e) => setMyFocus(e.target.value)}
                placeholder="e.g. Designing resilient event architectures and fine-tuning prompt embeddings"
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-stone-800">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-300">
              <input
                type="checkbox"
                checked={isOpenToChat}
                onChange={(e) => setIsOpenToChat(e.target.checked)}
                className="rounded accent-amber-500 w-4 h-4"
              />
              <span>Coffee Break Beacon Active (Open to friendly 5-min chats)</span>
            </label>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-all"
            >
              Confirm Presence
            </button>
          </div>
        </form>
      )}

      {/* Table Zone Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <span className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
          Filter by Café Zone:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['all', 'Quiet Studio', 'Sunlit Bay', 'Communal Oak', 'Counter'].map((zone) => (
            <button
              key={zone}
              onClick={() => setSelectedZone(zone)}
              className={`text-xs px-3 py-1.5 rounded-xl transition-all font-medium ${
                selectedZone === zone
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                  : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
              }`}
            >
              {zone === 'all' ? 'All Tables' : zone}
            </button>
          ))}
        </div>
      </div>

      {/* Patrons Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredPatrons.map((patron) => (
          <div
            key={patron.id}
            className="bg-stone-900/80 hover:bg-stone-850/90 border border-stone-800 hover:border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all shadow-lg space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center text-lg">
                    {patron.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-100 text-sm font-serif">
                      {patron.name}
                    </h3>
                    <p className="text-xs text-amber-400 font-medium">{patron.role}</p>
                  </div>
                </div>

                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  patron.isOpenToChat
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-stone-800 text-stone-500'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    patron.isOpenToChat ? 'bg-emerald-400 animate-pulse' : 'bg-stone-600'
                  }`}></span>
                  {patron.isOpenToChat ? 'Open to Chat' : 'In Deep Focus'}
                </span>
              </div>

              <div className="text-xs text-stone-400 flex items-center gap-1 font-mono">
                <MapPin className="w-3 h-3 text-stone-500" />
                {patron.tableZone}
              </div>

              <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 text-xs text-stone-300 leading-relaxed">
                <span className="text-[10px] font-mono uppercase text-stone-500 block mb-0.5">
                  Currently Working On:
                </span>
                "{patron.currentFocus}"
              </div>

              {/* Topic Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {patron.openTopics.map((topic) => (
                  <span
                    key={topic}
                    className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700/60"
                  >
                    #{topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Spark Conversation Button */}
            <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
              <span className="text-[11px] text-stone-500 font-mono">
                Ambient Radius: 5m
              </span>

              {patron.isOpenToChat ? (
                <button
                  onClick={() => handleSparkConversation(patron)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Spark AI Icebreaker
                </button>
              ) : (
                <span className="text-xs text-stone-500 italic">Headphones on 🎧</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* AI Icebreaker Modal */}
      {activeChatMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{activeChatMatch.patron.avatar}</span>
                <div>
                  <h3 className="text-base font-bold font-serif text-stone-100">
                    Spark Connection with {activeChatMatch.patron.name}
                  </h3>
                  <p className="text-xs text-amber-400">{activeChatMatch.patron.tableZone}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveChatMatch(null)}
                className="p-2 text-stone-400 hover:text-white rounded-xl bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isMatchingLoading ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto"></div>
                <p className="text-xs text-stone-400">
                  Gemini Agent is finding common intersection points between your focuses...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <span className="text-xs font-semibold text-amber-300">
                    Synergy Index Score:
                  </span>
                  <span className="text-base font-mono font-bold text-amber-400">
                    {activeChatMatch.synergyScore || 92}% Match
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-2">
                  <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                    Tailored Icebreaker Prompt:
                  </span>
                  <p className="text-xs text-stone-200 leading-relaxed font-serif italic">
                    "{activeChatMatch.icebreaker}"
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-stone-800/60 border border-stone-700 text-xs text-stone-400 space-y-1">
                  <span className="font-semibold text-stone-300 block">Suggested Conversation Bridge:</span>
                  <p>{activeChatMatch.suggestedTopic}</p>
                </div>

                <div className="p-3 rounded-xl bg-stone-950 text-[11px] text-stone-500">
                  💡 <strong className="text-stone-400">Café Etiquette Tip:</strong> Wave or stop by their table during your next pour-over break. A warm, casual greeting makes modern cafés memorable.
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-stone-800">
              <button
                onClick={() => setActiveChatMatch(null)}
                className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium text-xs transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
