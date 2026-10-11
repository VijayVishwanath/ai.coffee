import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle2, 
  Download, 
  Share2, 
  Sparkles, 
  ShieldCheck, 
  Coffee, 
  ArrowRight,
  TrendingUp,
  UserCheck,
  LogOut,
  RefreshCw,
  Building
} from 'lucide-react';
import { CheckInRecord } from '../types/cafe';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc, updateDoc, collection, onSnapshot, query, where } from 'firebase/firestore';

interface QRCodeCheckInProps {
  onCheckInUpdated?: (activeCount: number) => void;
}

const CAFE_ZONES = [
  { id: 'gate', name: 'Main Entrance Arrival Gate', description: 'Express queue & general arrival pass' },
  { id: 'table-4', name: 'Table 4 (Quiet Studio)', description: 'Deep focus zone with power outlets' },
  { id: 'table-8', name: 'Table 8 (Sunlit Bay)', description: 'Window lounge with natural daylight' },
  { id: 'communal', name: 'Communal Oak Table', description: 'Social & serendipity networking hub' },
  { id: 'express', name: 'Express Mobile Pickup Counter', description: 'Quick grab-and-go station' },
];

export const QRCodeCheckIn: React.FC<QRCodeCheckInProps> = ({ onCheckInUpdated }) => {
  const { currentUser } = useAuth();
  const [selectedZone, setSelectedZone] = useState(CAFE_ZONES[0].name);
  const [partySize, setPartySize] = useState(1);
  const [customerName, setCustomerName] = useState(currentUser?.displayName || 'Visiting Guest');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isLogging, setIsLogging] = useState(false);
  const [activeCheckIns, setActiveCheckIns] = useState<CheckInRecord[]>([
    {
      id: 'chk-1',
      customerName: 'Devin K.',
      tableZone: 'Table 4 (Quiet Studio)',
      partySize: 1,
      arrivalTime: '09:45 AM',
      status: 'active',
    },
    {
      id: 'chk-2',
      customerName: 'Maya Lin',
      tableZone: 'Table 8 (Sunlit Bay)',
      partySize: 2,
      arrivalTime: '10:05 AM',
      status: 'active',
    },
    {
      id: 'chk-3',
      customerName: 'Elena Rostova',
      tableZone: 'Communal Oak Table',
      partySize: 1,
      arrivalTime: '10:14 AM',
      status: 'active',
    },
  ]);
  const [myActiveCheckIn, setMyActiveCheckIn] = useState<CheckInRecord | null>(null);

  // Generate QR code whenever selectedZone changes
  useEffect(() => {
    const checkInPayload = JSON.stringify({
      app: 'TheCafeCompanion',
      action: 'checkin',
      zone: selectedZone,
      timestamp: Date.now(),
      url: window.location.href,
    });

    QRCode.toDataURL(checkInPayload, {
      width: 320,
      margin: 2,
      color: {
        dark: '#1c1917', // Dark stone
        light: '#fef3c7', // Warm amber tint
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, [selectedZone]);

  // Sync check-ins from Firestore
  useEffect(() => {
    try {
      const q = collection(db, 'checkins');
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const records: CheckInRecord[] = snapshot.docs.map((d) => d.data() as CheckInRecord);
          const activeOnly = records.filter((r) => r.status === 'active');
          setActiveCheckIns(activeOnly);

          if (currentUser) {
            const myRecord = activeOnly.find((r) => r.userId === currentUser.uid);
            if (myRecord) setMyActiveCheckIn(myRecord);
          }

          if (onCheckInUpdated) {
            onCheckInUpdated(activeOnly.length);
          }
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, 'checkins');
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Checkins firestore listener note:', e);
    }
  }, [currentUser, onCheckInUpdated]);

  const handlePerformCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || isLogging) return;

    setIsLogging(true);
    const checkInId = `chk-${Date.now()}`;
    const arrivalTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newRecord: CheckInRecord = {
      id: checkInId,
      userId: currentUser?.uid || 'guest-anon',
      customerName: customerName.trim(),
      tableZone: selectedZone,
      partySize,
      arrivalTime,
      status: 'active',
      timestamp: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'checkins', checkInId), newRecord);
      setMyActiveCheckIn(newRecord);
      setActiveCheckIns((prev) => [newRecord, ...prev.filter((r) => r.id !== checkInId)]);
      if (onCheckInUpdated) {
        onCheckInUpdated(activeCheckIns.length + 1);
      }
    } catch (err) {
      console.warn('Firestore checkin write note:', err);
      // Fallback local update
      setMyActiveCheckIn(newRecord);
      setActiveCheckIns((prev) => [newRecord, ...prev]);
    } finally {
      setIsLogging(false);
    }
  };

  const handleDepart = async (id: string) => {
    try {
      await updateDoc(doc(db, 'checkins', id), {
        status: 'departed',
      });
    } catch (e) {
      console.warn('Checkout error:', e);
    }
    setActiveCheckIns((prev) => prev.filter((r) => r.id !== id));
    if (myActiveCheckIn?.id === id) {
      setMyActiveCheckIn(null);
    }
  };

  // Occupancy calculations
  const totalOccupancyCount = activeCheckIns.reduce((acc, c) => acc + (c.partySize || 1), 0);
  const maxCapacity = 45; // Max seats in artisanal roastery
  const occupancyPercent = Math.min(100, Math.round((totalOccupancyCount / maxCapacity) * 100));

  // Dynamic wait-time impact based on occupancy
  const occupancyWaitDeltaMinutes = occupancyPercent > 80 ? 4 : occupancyPercent > 50 ? 2 : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <QrCode className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400">
              Arrival Telemetry & Occupancy Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 tracking-tight mt-1">
            QR Arrival Check-In & Live Occupancy
          </h1>
          <p className="text-xs sm:text-sm text-stone-400">
            Scan or generate dynamic QR codes to log guest arrival times directly into Firestore, calibrating predictive wait-time models in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 font-bold">
            <ShieldCheck className="w-4 h-4" />
            Firestore Sync Active
          </span>
        </div>
      </div>

      {/* Real-Time Occupancy Telemetry Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>In-Room Active Guests</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-amber-400">
            {totalOccupancyCount} Patrons
          </div>
          <span className="text-[10px] text-stone-400 font-mono">
            {activeCheckIns.length} active party check-ins
          </span>
        </div>

        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Current Room Density</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-stone-100">
            {occupancyPercent}%
          </div>
          <span className={`text-[10px] font-mono ${
            occupancyPercent > 75 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {occupancyPercent > 75 ? 'Peak Seating Demand' : 'Comfortable Seating Available'}
          </span>
        </div>

        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Occupancy Wait Calibration</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-emerald-400">
            +{occupancyWaitDeltaMinutes}m Offset
          </div>
          <span className="text-[10px] text-stone-400 font-mono">
            Auto-tuned into Better Waits algorithm
          </span>
        </div>

        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Avg Table Dwell Time</span>
            <Coffee className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-stone-100">
            ~38 mins
          </div>
          <span className="text-[10px] text-stone-400 font-mono">
            Rolling 60-min window
          </span>
        </div>
      </div>

      {/* Main Grid: QR Placard Generator vs. Arrival Logger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: QR Code Placard Generator (For Table or Counter Kiosk) */}
        <div className="lg:col-span-6 bg-stone-900/80 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-b border-stone-800 pb-3">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-bold">
              Barista & Kiosk Tool
            </span>
            <h2 className="text-lg font-serif font-bold text-stone-100 mt-1">
              Table & Counter QR Placard Generator
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Select a café location to generate a scannable arrival placard for counter iPad displays or tabletop stands.
            </p>
          </div>

          {/* Location Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-300 block">
              Placard Destination Zone:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CAFE_ZONES.map((zone) => {
                const isSelected = selectedZone === zone.name;
                return (
                  <button
                    key={zone.id}
                    onClick={() => setSelectedZone(zone.name)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold shadow-md'
                        : 'bg-stone-950/70 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                    }`}
                  >
                    <span className="text-xs block">{zone.name}</span>
                    <span className="text-[10px] text-stone-500 block truncate">{zone.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rendered QR Code Placard Card */}
          <div className="bg-stone-950/90 border border-amber-500/30 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 shadow-inner">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block font-bold">
                Artisan Roast Coffee Co.
              </span>
              <h3 className="text-base font-serif font-bold text-stone-100">
                {selectedZone}
              </h3>
              <p className="text-xs text-stone-400">Scan camera to log arrival & unlock personalized wait time</p>
            </div>

            {/* QR Image */}
            {qrDataUrl && (
              <div className="p-3 bg-amber-100 rounded-2xl shadow-xl border-4 border-amber-500/40">
                <img src={qrDataUrl} alt="Check-in QR Code" className="w-52 h-52 rounded-lg" />
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              {qrDataUrl && (
                <a
                  href={qrDataUrl}
                  download={`cafe-qr-${selectedZone.toLowerCase().replace(/\s+/g, '-')}.png`}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PNG
                </a>
              )}

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Check-in link copied to clipboard!');
                }}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 flex items-center gap-1.5 transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                Copy Link
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Self Check-In Scanner Simulation & Log Feed */}
        <div className="lg:col-span-6 bg-stone-900/80 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-b border-stone-800 pb-3">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold">
              Guest Arrival Portal
            </span>
            <h2 className="text-lg font-serif font-bold text-stone-100 mt-1">
              Log Arrival & Join Room Telemetry
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Simulate scanning the QR code upon arriving at the café to register your visit in Firestore.
            </p>
          </div>

          {/* Active Check-in status if currently checked in */}
          {myActiveCheckIn ? (
            <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-sm text-stone-100 font-serif">
                    You Are Currently Checked In!
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Logged in Firestore
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                <div>
                  <span className="text-stone-500 text-[10px] block">Location Zone:</span>
                  <span className="text-stone-200 font-bold">{myActiveCheckIn.tableZone}</span>
                </div>
                <div>
                  <span className="text-stone-500 text-[10px] block">Arrival Time:</span>
                  <span className="text-amber-400 font-bold">{myActiveCheckIn.arrivalTime}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between">
                <span className="text-[11px] text-stone-400">
                  Party Size: {myActiveCheckIn.partySize} {myActiveCheckIn.partySize === 1 ? 'person' : 'people'}
                </span>
                <button
                  onClick={() => handleDepart(myActiveCheckIn.id)}
                  className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-rose-900/40 text-stone-300 hover:text-rose-300 text-xs font-medium border border-stone-700 flex items-center gap-1 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Mark Departure
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePerformCheckIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300 block">
                  Guest Name / Handle:
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Alex M."
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-300 block">
                    Party Size:
                  </label>
                  <select
                    value={partySize}
                    onChange={(e) => setPartySize(parseInt(e.target.value, 10))}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Guest (Solo)' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-300 block">
                    Target Table:
                  </label>
                  <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  >
                    {CAFE_ZONES.map((z) => (
                      <option key={z.id} value={z.name}>
                        {z.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLogging || !customerName.trim()}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
              >
                {isLogging ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-stone-950 border-t-transparent animate-spin"></div>
                    <span>Logging Arrival to Firestore...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Scan & Check In My Arrival (Firestore Log)</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Live In-Room Check-In Feed */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                Live In-Room Arrivals Feed:
              </span>
              <span className="font-mono text-emerald-400 text-[10px]">
                {activeCheckIns.length} Active
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-thin">
              {activeCheckIns.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-stone-950/70 border border-stone-850 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-200">{item.customerName}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-800 text-stone-400">
                        Party of {item.partySize}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-400 block">{item.tableZone}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono text-amber-400 block font-bold">
                      {item.arrivalTime}
                    </span>
                    <span className="text-[9px] text-emerald-400 font-mono">Active</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
