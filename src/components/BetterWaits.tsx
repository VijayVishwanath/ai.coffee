import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Flame, 
  Users, 
  ArrowRight, 
  TrendingUp, 
  Coffee, 
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { Order, OrderStatus } from '../types/cafe';
import { HOURLY_TRAFFIC_DATA } from '../data/mockData';

interface BetterWaitsProps {
  orders: Order[];
  onAdvanceOrderStatus: (orderId: string) => void;
  onResetDemoOrders: () => void;
  checkedInCount?: number;
  onNavigateToQRCheckIn?: () => void;
}

export const BetterWaits: React.FC<BetterWaitsProps> = ({
  orders,
  onAdvanceOrderStatus,
  onResetDemoOrders,
  checkedInCount = 18,
  onNavigateToQRCheckIn,
}) => {
  const [activeBaristas, setActiveBaristas] = useState(3);
  const [selectedHour, setSelectedHour] = useState('10 AM');

  // Compute live queue metrics
  const queuedOrders = orders.filter((o) => o.status === 'queued' || o.status === 'received');
  const brewingOrders = orders.filter((o) => o.status === 'brewing');
  const readyOrders = orders.filter((o) => o.status === 'ready');

  // Dynamic wait time algorithm calibrated with real-time QR arrival occupancy
  const totalItemComplexityMinutes = queuedOrders.reduce((acc, order) => {
    const orderPrep = order.items.reduce((sum, item) => sum + (item.prepMinutes || 2.5), 0);
    return acc + orderPrep;
  }, 0);

  // Additional occupancy load offset (each 10 in-room patrons adds ~0.8m queue pressure)
  const occupancyOffset = Math.round((checkedInCount / 10) * 0.8);

  const predictedWaitMinutes = Math.max(
    2,
    Math.round((totalItemComplexityMinutes / activeBaristas) + 1.2 + occupancyOffset)
  );

  const currentTrafficItem = HOURLY_TRAFFIC_DATA.find((h) => h.hour === selectedHour) || HOURLY_TRAFFIC_DATA[3];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Clock className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400">
              Predictive Queuing Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 tracking-tight mt-1">
            Better Waits & Order Journey
          </h1>
          <p className="text-xs sm:text-sm text-stone-400">
            Real-time drink preparation forecasting, station load balancing, and historical rush predictions calibrated via live QR arrival logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToQRCheckIn && (
            <button
              onClick={onNavigateToQRCheckIn}
              className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Check-In Kiosk</span>
            </button>
          )}

          <button
            onClick={onResetDemoOrders}
            className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium border border-stone-700 flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo Queue
          </button>
        </div>
      </div>

      {/* Real-Time QR Arrival Occupancy Telemetry Banner */}
      <div className="bg-stone-900/60 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-stone-200 block">
              Real-Time Occupancy Telemetry (Firestore Synced):
            </span>
            <p className="text-stone-400 text-[11px]">
              <strong className="text-amber-400">{checkedInCount} checked-in guests</strong> currently in the room. Wait prediction auto-adjusted by +{occupancyOffset}m.
            </p>
          </div>
        </div>

        {onNavigateToQRCheckIn && (
          <button
            onClick={onNavigateToQRCheckIn}
            className="text-amber-400 hover:text-amber-300 font-mono text-xs flex items-center gap-1 underline underline-offset-2 shrink-0"
          >
            Manage QR Placards & Arrivals &rarr;
          </button>
        )}
      </div>

      {/* KPI Cards: Dynamic Wait Forecast */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Predicted Wait For New Orders</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-amber-400">
            ~{predictedWaitMinutes} mins
          </div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            Calibrated with QR arrival density
          </p>
        </div>

        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Active Station Baristas</span>
            <Users className="w-4 h-4 text-stone-400" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold font-mono text-stone-100">
              {activeBaristas} Baristas
            </span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] text-stone-500">Staffing level:</span>
            {[1, 2, 3, 4].map((count) => (
              <button
                key={count}
                onClick={() => setActiveBaristas(count)}
                className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold transition-all ${
                  activeBaristas === count
                    ? 'bg-amber-500 text-stone-950'
                    : 'bg-stone-800 text-stone-400 hover:text-white'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Orders In Progress</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold font-mono text-stone-100">
            {queuedOrders.length + brewingOrders.length}
          </div>
          <p className="text-[11px] text-stone-400">
            {brewingOrders.length} currently on espresso/pour-over
          </p>
        </div>

        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Ready at Counter</span>
            <Coffee className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-400">
            {readyOrders.length} orders
          </div>
          <p className="text-[11px] text-stone-400">Awaiting customer collection</p>
        </div>
      </div>

      {/* Live Order Lifecycle & Eventarc Progression */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-serif font-bold text-stone-100">
              Live Order Lifecycle Tracker (Pub/Sub Eventarc Mesh)
            </h2>
            <p className="text-xs text-stone-400">
              Track active guest tickets through asynchronous state transitions with end-to-end tracing
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-stone-800 text-stone-300 border border-stone-700">
            Event Topic: <span className="text-amber-400">projects/cafe-app/topics/orders</span>
          </span>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order) => {
            const getStepNumber = (s: OrderStatus) => {
              switch (s) {
                case 'received': return 1;
                case 'queued': return 2;
                case 'brewing': return 3;
                case 'ready': return 4;
                case 'completed': return 5;
              }
            };
            const currentStep = getStepNumber(order.status);

            return (
              <div
                key={order.id}
                className="bg-stone-950/70 border border-stone-800 rounded-2xl p-5 space-y-4 shadow-sm"
              >
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400 text-sm">
                        {order.id}
                      </span>
                      <span className="text-stone-300 font-semibold text-sm">
                        {order.customerName}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700">
                        {order.eventTraceId}
                      </span>
                    </div>
                    <div className="text-xs text-stone-400 mt-1">
                      {order.items.map((i) => `${i.quantity}x ${i.name}`).join(' • ')} (Total: ${order.totalAmount.toFixed(2)})
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[11px] text-stone-500 block">Target Readiness</span>
                      <span className="text-xs font-mono font-semibold text-stone-200">
                        {order.estimatedReadyAt}
                      </span>
                    </div>
                    {order.status !== 'completed' && (
                      <button
                        onClick={() => onAdvanceOrderStatus(order.id)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1 transition-all shadow-md"
                        title="Simulate barista next step"
                      >
                        <Play className="w-3 h-3" />
                        Advance Status
                      </button>
                    )}
                  </div>
                </div>

                {/* Stepper Progress Bar */}
                <div className="relative pt-2 pb-1">
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    {[
                      { step: 1, label: 'Order Dispatched', desc: 'Pub/Sub Ingestion' },
                      { step: 2, label: 'Queued at Bar', desc: 'Ingredients Allocated' },
                      { step: 3, label: 'Brewing & Craft', desc: order.assignedBaristaStation },
                      { step: 4, label: 'Ready at Counter', desc: 'Pickup Chime Triggered' },
                    ].map((st) => {
                      const isComplete = currentStep > st.step || order.status === 'ready' && st.step <= 4;
                      const isCurrent = currentStep === st.step;

                      return (
                        <div
                          key={st.step}
                          className={`p-3 rounded-xl border transition-all ${
                            isCurrent
                              ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md font-semibold'
                              : isComplete
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-medium'
                              : 'bg-stone-900/60 border-stone-800 text-stone-500'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1.5 mb-1 font-mono text-xs">
                            {isComplete ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                                isCurrent ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-800 text-stone-400'
                              }`}>
                                {st.step}
                              </span>
                            )}
                            <span>{st.label}</span>
                          </div>
                          <span className="text-[10px] text-stone-400 block truncate">
                            {st.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Best Time to Visit: Hourly Rush Forecast */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <h2 className="text-lg font-serif font-bold text-stone-100">
                Best Time to Visit: Predictive Traffic Curves
              </h2>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Plan your visit for uninterrupted deep work, quiet reading, or speedy grab-and-go.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-300 font-mono bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              ⭐ Sweet Spot Today: 2:00 PM – 4:00 PM
            </span>
          </div>
        </div>

        {/* Traffic Bar Chart */}
        <div className="space-y-4">
          <div className="grid grid-cols-11 gap-1.5 sm:gap-2 items-end h-44 pt-6 px-2 bg-stone-950/70 border border-stone-800 rounded-2xl">
            {HOURLY_TRAFFIC_DATA.map((item) => {
              const isSelected = selectedHour === item.hour;
              const isPeak = item.traffic > 80;
              const isOasis = item.traffic < 50;

              return (
                <div
                  key={item.hour}
                  onClick={() => setSelectedHour(item.hour)}
                  className="flex flex-col items-center h-full justify-end cursor-pointer group"
                >
                  {/* Traffic Bar */}
                  <div
                    style={{ height: `${(item.traffic / 100) * 110}px` }}
                    className={`w-full max-w-[32px] rounded-t-lg transition-all relative ${
                      isSelected
                        ? 'bg-amber-400 shadow-lg shadow-amber-400/30'
                        : isPeak
                        ? 'bg-rose-500/70 hover:bg-rose-500'
                        : isOasis
                        ? 'bg-emerald-500/60 hover:bg-emerald-500'
                        : 'bg-amber-600/60 hover:bg-amber-500'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-stone-900 border border-amber-500 text-amber-300 text-[10px] font-mono px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                        {item.avgWaitMin}m
                      </div>
                    )}
                  </div>
                  <span className={`text-[10px] mt-2 font-mono ${
                    isSelected ? 'text-amber-400 font-bold' : 'text-stone-400 group-hover:text-stone-200'
                  }`}>
                    {item.hour}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Selected Hour Details */}
          <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {currentTrafficItem.hour} Window
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                  {currentTrafficItem.label}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                  Room Vibe: {currentTrafficItem.vibe}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Average wait time is <strong className="text-stone-200">{currentTrafficItem.avgWaitMin} minutes</strong> with {currentTrafficItem.traffic}% seating density.
              </p>
            </div>

            <div className="text-right w-full sm:w-auto">
              <span className="text-[11px] font-mono text-stone-400 block">Traffic Index</span>
              <span className="text-lg font-bold font-mono text-stone-200">
                {currentTrafficItem.traffic} / 100
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
