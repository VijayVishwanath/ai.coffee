import React, { useState } from 'react';
import { 
  Cpu, 
  Sparkles, 
  CloudRain, 
  Sun, 
  Calendar, 
  TrendingUp, 
  Package, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  ArrowRight,
  Zap,
  Play
} from 'lucide-react';
import { DemandForecastData } from '../types/cafe';

export const PredictiveDemand: React.FC = () => {
  const [weather, setWeather] = useState('Rainy 13°C (Cold drizzle)');
  const [hourOfDay, setHourOfDay] = useState(14);
  const [nearbyEvent, setNearbyEvent] = useState('Google Cloud Developer Hackathon (450 attendees)');
  const [isLoading, setIsLoading] = useState(false);
  const [forecast, setForecast] = useState<DemandForecastData>({
    surgePrediction: 'Afternoon Comfort Surge: +34% Hot Specialty Drinks expected due to rainy chill & nearby tech meetup.',
    expectedHourlyOrders: 86,
    hotVsColdRatio: '80% Hot / 20% Cold',
    automatedActions: [
      'Autonomous Barista Task: Pre-grind 500g Ethiopian single-origin for 2:30 PM pour-over rush',
      'Inventory Pub/Sub Dispatch: Auto-allocate 8 extra oat milk cartons to Bar 1 station',
      'Queue Optimization: Enable dual-barista espresso extraction mode on Synesso Hydra machine',
    ],
    stockRisk: 'Low (Safe buffer maintained)',
    projectedRevenueDelta: '+22.4%',
  });

  const handleRunForecast = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/demand/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weather,
          hourOfDay,
          eventNearby: nearbyEvent,
        }),
      });

      if (!response.ok) throw new Error('Forecast failed');
      const data = await response.json();
      setForecast(data);
    } catch (e) {
      console.error(e);
      setForecast({
        surgePrediction: `Simulated surge for ${weather} at ${hourOfDay}:00 during ${nearbyEvent}.`,
        expectedHourlyOrders: Math.round(50 + Math.random() * 40),
        hotVsColdRatio: weather.includes('Rain') ? '85% Hot / 15% Cold' : '45% Hot / 55% Cold',
        automatedActions: [
          'Pub/Sub Trigger: Auto-adjust cold brew steep volume for next morning cycle',
          'Barista Dispatch: Schedule 1 additional barista at 2:00 PM',
          'Pastry Buffer: Request warming of 12 additional Cardamom buns',
        ],
        stockRisk: 'Low',
        projectedRevenueDelta: '+18.5%',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Cpu className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400">
              Agentic Inventory & Demand AI
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 tracking-tight mt-1">
            Predictive Demand & Prep Autopilot
          </h1>
          <p className="text-xs sm:text-sm text-stone-400">
            Autonomous agent continuously synthesizes ambient weather, campus schedules, and real-time inventory to balance barista workload and prevent stockouts.
          </p>
        </div>

        <button
          onClick={handleRunForecast}
          disabled={isLoading}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shrink-0"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-stone-950 border-t-transparent animate-spin"></div>
              <span>Simulating with Vertex AI...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Simulate Demand Scenario</span>
            </>
          )}
        </button>
      </div>

      {/* Simulation Scenario Controls */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <h2 className="text-base font-serif font-bold text-stone-100 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          Interactive Scenario Parameters
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Weather condition */}
          <div className="space-y-2">
            <label className="font-semibold text-stone-300 block flex items-center gap-1.5">
              <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
              Weather Condition:
            </label>
            <select
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-100 focus:outline-none focus:border-amber-500"
            >
              <option value="Rainy 13°C (Cold drizzle)">Rainy 13°C (Cold drizzle)</option>
              <option value="Warm Sunny 28°C (Heatwave)">Warm Sunny 28°C (Heatwave)</option>
              <option value="Crisp Autumn 16°C (Breezy)">Crisp Autumn 16°C (Breezy)</option>
              <option value="Morning Fog & Frost 7°C">Morning Fog & Frost 7°C</option>
            </select>
          </div>

          {/* Hour of day */}
          <div className="space-y-2">
            <label className="font-semibold text-stone-300 block flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Simulation Hour: {hourOfDay}:00
            </label>
            <input
              type="range"
              min="7"
              max="17"
              value={hourOfDay}
              onChange={(e) => setHourOfDay(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 h-2 bg-stone-800 rounded-lg cursor-pointer mt-3"
            />
            <div className="flex justify-between text-[10px] text-stone-500 font-mono">
              <span>07:00 (Open)</span>
              <span>12:00 (Noon)</span>
              <span>17:00 (Close)</span>
            </div>
          </div>

          {/* Local Event */}
          <div className="space-y-2">
            <label className="font-semibold text-stone-300 block flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Nearby Community Event:
            </label>
            <select
              value={nearbyEvent}
              onChange={(e) => setNearbyEvent(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-100 focus:outline-none focus:border-amber-500"
            >
              <option value="Google Cloud Developer Hackathon (450 attendees)">
                Google Cloud Developer Hackathon (450 attendees)
              </option>
              <option value="University Midterm Finals Week">
                University Midterm Finals Week
              </option>
              <option value="Morning 10K Waterfront Marathon">
                Morning 10K Waterfront Marathon
              </option>
              <option value="Standard Quiet Weekday">
                Standard Quiet Weekday
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Forecast Output KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Expected Hourly Orders</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-amber-400">
            {forecast.expectedHourlyOrders} / hr
          </div>
          <p className="text-[11px] text-stone-400">Auto-balanced across 3 stations</p>
        </div>

        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Hot vs. Cold Ratio</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-stone-100">
            {forecast.hotVsColdRatio}
          </div>
          <p className="text-[11px] text-stone-400">Paced steam boiler duty cycle</p>
        </div>

        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Stockout Risk Level</span>
            <Package className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {forecast.stockRisk}
          </div>
          <p className="text-[11px] text-stone-400">Pub/Sub reorder threshold 25%</p>
        </div>

        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Projected Revenue Delta</span>
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-400">
            {forecast.projectedRevenueDelta}
          </div>
          <p className="text-[11px] text-stone-400">Driven by intelligent pairing</p>
        </div>
      </div>

      {/* Autonomous Barista & Inventory Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-stone-900/80 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="border-b border-stone-800 pb-3">
            <h2 className="text-lg font-serif font-bold text-stone-100">
              Autonomous Actions Dispatched to Stations
            </h2>
            <p className="text-xs text-stone-400">
              Agentic actions automatically executed without requiring barista distraction.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs text-stone-200 leading-relaxed font-serif italic">
            "{forecast.surgePrediction}"
          </div>

          <div className="space-y-3">
            {forecast.automatedActions.map((action, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 flex items-start gap-3 shadow-sm"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <span className="text-xs font-semibold text-stone-100 block">
                    {action}
                  </span>
                  <span className="text-[10px] font-mono text-stone-500 mt-1 block">
                    Dispatched via Cloud Eventarc • Status: Executed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory depletion choreography */}
        <div className="lg:col-span-5 bg-stone-900/80 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="border-b border-stone-800 pb-3">
            <h2 className="text-lg font-serif font-bold text-stone-100">
              Event-Driven Supply Pipeline
            </h2>
            <p className="text-xs text-stone-400">
              Asynchronous decoupling with Google Cloud Spanner & Memorystore.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-stone-200 block">Single-Origin Geisha Beans</span>
                <span className="text-[11px] text-stone-500">Stock: 18 pour-overs</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Pacing V60
              </span>
            </div>

            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-stone-200 block">Organic Oat Milk (Oatly Barista)</span>
                <span className="text-[11px] text-stone-500">Stock: 34 cartons (Safe buffer)</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Adequate
              </span>
            </div>

            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-stone-200 block">Cardamom Morning Buns</span>
                <span className="text-[11px] text-stone-500">Stock: 24 remaining</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Warm Batch 2 Triggered
              </span>
            </div>

            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-stone-200 block">Nitro Cold Brew Keg</span>
                <span className="text-[11px] text-stone-500">Pressure: 45 PSI (72% full)</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Draft Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
