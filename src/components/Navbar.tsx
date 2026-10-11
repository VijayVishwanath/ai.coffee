import React from 'react';
import { 
  Coffee, 
  Sparkles, 
  Layers, 
  Activity, 
  Users, 
  ShoppingBag, 
  Cpu, 
  Compass, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Music, 
  Mic, 
  LogIn, 
  LogOut, 
  User as UserIcon,
  QrCode
} from 'lucide-react';
import { OrderItem } from '../types/cafe';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: 'order' | 'waits' | 'discovery' | 'connect' | 'room' | 'soundtrack' | 'checkin' | 'demand' | 'architecture';
  setActiveTab: (tab: 'order' | 'waits' | 'discovery' | 'connect' | 'room' | 'soundtrack' | 'checkin' | 'demand' | 'architecture') => void;
  cartItems: OrderItem[];
  setIsCartOpen: (open: boolean) => void;
  activeOrdersCount: number;
  onOpenLiveVoice: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  cartItems,
  setIsCartOpen,
  activeOrdersCount,
  onOpenLiveVoice,
}) => {
  const { currentUser, signInWithGoogle, logout, userProfile } = useAuth();
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 text-stone-100 shadow-xl">
      {/* Top Banner: Architecture & Google Cloud Indicator */}
      <div className="bg-stone-950 px-4 py-1.5 border-b border-stone-800/80 text-xs flex flex-wrap items-center justify-between text-stone-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-amber-400 font-semibold tracking-wide uppercase text-[10px]">
            <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
            Google Cloud Platform
          </span>
          <span className="hidden sm:inline text-stone-600">|</span>
          <span className="hidden sm:inline flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-emerald-400 font-mono text-[11px]">Firebase Auth & Firestore Online</span>
          </span>
          <span className="hidden md:inline text-stone-600">|</span>
          <span className="hidden md:inline text-stone-400 font-mono text-[11px]">
            Pub/Sub Event Mesh: 240 msg/s
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenLiveVoice}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 transition-all font-mono text-[11px]"
          >
            <Mic className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>Gemini 3.8 Live API Voice</span>
          </button>
          <span className="text-stone-600 hidden sm:inline">|</span>
          <span className="hidden sm:inline flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            99.999% SLA Spanner
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => setActiveTab('order')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 flex items-center justify-center shadow-lg shadow-amber-950/40 border border-amber-500/30">
              <Coffee className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-amber-100 font-serif">
                  The Café Companion
                </span>
                <span className="hidden md:inline px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Firebase + AI
                </span>
              </div>
              <p className="text-[11px] text-stone-400 hidden sm:block">Artisan Roastery & Autonomous Cloud Hub</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="hidden xl:flex items-center gap-1 bg-stone-950/70 p-1 rounded-xl border border-stone-800">
            <button
              onClick={() => setActiveTab('order')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'order'
                  ? 'bg-amber-600 text-stone-900 shadow-md font-semibold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              Ordering
            </button>

            <button
              onClick={() => setActiveTab('waits')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'waits'
                  ? 'bg-amber-600 text-stone-900 shadow-md font-semibold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Waits
              {activeOrdersCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-stone-900 font-bold">
                  {activeOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('discovery')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'discovery'
                  ? 'bg-amber-600 text-stone-900 shadow-md font-semibold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Discovery
            </button>

            <button
              onClick={() => setActiveTab('connect')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'connect'
                  ? 'bg-amber-600 text-stone-900 shadow-md font-semibold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Connect
            </button>

            <button
              onClick={() => setActiveTab('room')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'room'
                  ? 'bg-amber-600 text-stone-900 shadow-md font-semibold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Room Pulse
            </button>

            <button
              onClick={() => setActiveTab('soundtrack')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'soundtrack'
                  ? 'bg-purple-600 text-white shadow-md font-semibold'
                  : 'text-purple-300 hover:text-white hover:bg-purple-950/40'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              Lyria Music
            </button>

            <button
              onClick={() => setActiveTab('checkin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'checkin'
                  ? 'bg-amber-600 text-stone-900 shadow-md font-semibold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              QR Check-In
            </button>

            <button
              onClick={() => setActiveTab('demand')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'demand'
                  ? 'bg-amber-600 text-stone-900 shadow-md font-semibold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Demand AI
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'architecture'
                  ? 'bg-amber-600 text-stone-900 shadow-md font-semibold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Architecture
            </button>
          </nav>

          {/* Actions: Live Voice, Firebase Auth & Cart */}
          <div className="flex items-center gap-2">
            {/* Live Voice Barista Modal Trigger */}
            <button
              onClick={onOpenLiveVoice}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 transition-all text-xs font-medium"
              title="Launch Gemini 3.8 Live Voice Barista"
            >
              <Mic className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Live Voice</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 transition-all text-xs font-medium"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Tray</span>
              {totalCartCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Google Sign-in with Firebase Auth */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-stone-950 border border-stone-800 rounded-xl px-2.5 py-1.5">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-6 h-6 rounded-full border border-amber-500/40"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-stone-950 font-bold text-xs flex items-center justify-center">
                    {(currentUser.displayName || 'G')[0]}
                  </div>
                )}
                <div className="hidden md:block text-left text-[11px] leading-tight">
                  <span className="font-semibold text-stone-200 block truncate max-w-[90px]">
                    {currentUser.displayName?.split(' ')[0] || 'Guest'}
                  </span>
                  <span className="text-amber-400 text-[10px] font-mono">
                    {userProfile?.loyaltyBeans || 120} Beans
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-1 text-stone-400 hover:text-rose-400 transition-all"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition-all text-xs shadow-md"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="xl:hidden flex items-center gap-1 overflow-x-auto py-2.5 scrollbar-none border-t border-stone-800/60">
          {[
            { id: 'order', label: 'Order', icon: Coffee },
            { id: 'waits', label: 'Waits', icon: Clock },
            { id: 'discovery', label: 'Flavors', icon: Compass },
            { id: 'connect', label: 'Connect', icon: Users },
            { id: 'room', label: 'Room Pulse', icon: Activity },
            { id: 'soundtrack', label: 'Lyria Music', icon: Music },
            { id: 'checkin', label: 'QR Check-In', icon: QrCode },
            { id: 'demand', label: 'Demand AI', icon: Cpu },
            { id: 'architecture', label: 'Architecture', icon: Layers },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as typeof activeTab)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
                  isActive
                    ? 'bg-amber-600 text-stone-900 font-semibold'
                    : 'bg-stone-800/80 text-stone-300'
                }`}
              >
                <Icon className="w-3 h-3" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
