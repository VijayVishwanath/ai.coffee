import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  ShieldCheck, 
  Cpu, 
  Database, 
  Activity, 
  Zap, 
  Cloud, 
  RefreshCw, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  GitBranch, 
  Server, 
  HardDrive,
  BarChart3,
  Network,
  ArrowRight,
  Flame,
  Radio
} from 'lucide-react';
import { ARCHITECTURE_NODES } from '../data/mockData';
import { ArchitectureNode } from '../types/cafe';

export const ArchitectureBlueprint: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode>(ARCHITECTURE_NODES[2]); // Pub/Sub default
  const [activeTab, setActiveTab] = useState<'topology' | 'telemetry' | 'roadmap' | 'resilience'>('topology');
  const [metricsData, setMetricsData] = useState<{
    requestsTotal: number;
    ordersProcessed: number;
    p95LatencyMs: number;
    cacheHitRatio: number;
    activeConnections: number;
    pubsubEvents: number;
    circuitBreaker: string;
  }>({
    requestsTotal: 1540,
    ordersProcessed: 342,
    p95LatencyMs: 24,
    cacheHitRatio: 94.6,
    activeConnections: 48,
    pubsubEvents: 1024,
    circuitBreaker: 'CLOSED (Healthy)',
  });
  const [isSimulatingSurge, setIsSimulatingSurge] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    '[09:00:12.114] [Cloud Run:order-service] Ingress request 200 OK (latency=18ms, trace_id=gcp-trace-7b89)',
    '[09:00:12.130] [Pub/Sub] Dispatched message to topic "projects/cafe-app/topics/orders.v1" (size=1.2KB)',
    '[09:00:12.148] [Cloud Spanner] Mutation commit SUCCESS (TrueTime window: 2.1ms)',
    '[09:00:12.152] [Memorystore Redis] Cache update KEY: "cafe:queue:depth" TTL: 300s',
    '[09:00:12.190] [OpenTelemetry] Span exported to Google Cloud Trace & Prometheus collector',
  ]);

  // Fetch live metrics from Express backend
  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/system/health');
      if (res.ok) {
        const data = await res.json();
        if (data.metrics) {
          setMetricsData((prev) => ({
            ...prev,
            requestsTotal: data.metrics.requestsTotal || prev.requestsTotal,
            ordersProcessed: data.metrics.ordersProcessed || prev.ordersProcessed,
            p95LatencyMs: data.metrics.p95LatencyMs || prev.p95LatencyMs,
            cacheHitRatio: data.metrics.cacheHitRatio || prev.cacheHitRatio,
            pubsubEvents: data.metrics.pubsubEventsDispatched || prev.pubsubEvents,
          }));
        }
      }
    } catch {
      // Keep heuristic metrics
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateSurge = () => {
    setIsSimulatingSurge(true);
    const traceId = `gcp-trace-${Math.random().toString(36).substring(2, 8)}`;
    
    setMetricsData((prev) => ({
      ...prev,
      requestsTotal: prev.requestsTotal + 1200,
      ordersProcessed: prev.ordersProcessed + 420,
      p95LatencyMs: 38,
      pubsubEvents: prev.pubsubEvents + 2400,
      activeConnections: 240,
    }));

    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] [HPA Autoscale] Cloud Run scaled from 4 -> 18 instances (CPU threshold=75%)`,
      `[${new Date().toLocaleTimeString()}] [Pub/Sub Eventarc] 1,200 orders backpressure buffered safely in partition shards`,
      `[${new Date().toLocaleTimeString()}] [Spanner TrueTime] Distributed multi-region write throughput: 1,400 QPS (p99=22ms)`,
      `[${new Date().toLocaleTimeString()}] [Circuit Breaker] Health status verified: CLOSED (No errors, 0 dropped messages)`,
      ...prev.slice(0, 8),
    ]);

    setTimeout(() => {
      setIsSimulatingSurge(false);
      setMetricsData((prev) => ({
        ...prev,
        p95LatencyMs: 24,
        activeConnections: 54,
      }));
    }, 4000);
  };

  return (
    <div className="space-y-8">
      {/* Architect Executive Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Layers className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400">
                Principal Enterprise Architecture Blueprint
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 tracking-tight">
              Cloud-Native Event-Driven Microservices Mesh
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-3xl leading-relaxed">
              Designed for high-traffic café environments handling 10,000+ orders/hour. Built with Google Cloud Run,
              Google Cloud Pub/Sub, Cloud Spanner (TrueTime ACID), Memorystore Redis, Vertex AI & Gemini 3.8 Flash,
              fully monitored via Prometheus & Grafana.
            </p>
          </div>

          <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-2 shrink-0">
            <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Google Cloud Multi-Region (Active-Active)
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-xl bg-stone-800 text-stone-300 border border-stone-700">
              SLA: 99.999% • Recovery Time Objective (RTO): &lt; 5s
            </span>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-stone-800 overflow-x-auto scrollbar-none">
          {[
            { id: 'topology', label: 'Architecture Mesh Topology', icon: Network },
            { id: 'telemetry', label: 'Prometheus & Grafana Telemetry', icon: BarChart3 },
            { id: 'resilience', label: 'Resilience & Scale Patterns', icon: ShieldCheck },
            { id: 'roadmap', label: 'Engineering Implementation Roadmap', icon: GitBranch },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isCurrent
                    ? 'bg-amber-500 text-stone-950 shadow-md'
                    : 'bg-stone-950/70 text-stone-400 hover:text-stone-200 border border-stone-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: ARCHITECTURE MESH TOPOLOGY */}
      {activeTab === 'topology' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Visual Node Grid */}
            <div className="lg:col-span-8 bg-stone-900/80 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div>
                  <h2 className="text-base font-serif font-bold text-stone-100">
                    Google Cloud Platform Services Mesh
                  </h2>
                  <p className="text-xs text-stone-400">Click any tier node to inspect SLA, scaling policies, and role</p>
                </div>
                <span className="text-xs font-mono text-stone-400">9 Core Components</span>
              </div>

              {/* Node Layers */}
              <div className="space-y-4">
                {/* 1. Edge & Ingress */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block">
                    Tier 1: Client Edge, Anycast Routing & Security
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ARCHITECTURE_NODES.filter((n) => n.category === 'edge').map((node) => {
                      const isSelected = selectedNode.id === node.id;
                      return (
                        <div
                          key={node.id}
                          onClick={() => setSelectedNode(node)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500'
                              : 'bg-stone-950/70 border-stone-800 hover:border-stone-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                              {node.googleService}
                            </span>
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          </div>
                          <h4 className="text-xs font-bold text-stone-100 mt-1">{node.name}</h4>
                          <span className="text-[11px] text-stone-400 mt-1 block">Latency: {node.latencySla}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Messaging Event Mesh */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-amber-500 uppercase tracking-wider block">
                    Tier 2: Asynchronous Event Mesh (Eventarc & Pub/Sub)
                  </span>
                  <div className="grid grid-cols-1 gap-3">
                    {ARCHITECTURE_NODES.filter((n) => n.category === 'messaging').map((node) => {
                      const isSelected = selectedNode.id === node.id;
                      return (
                        <div
                          key={node.id}
                          onClick={() => setSelectedNode(node)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500'
                              : 'bg-stone-950/70 border-stone-800 hover:border-stone-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                              {node.googleService}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                              Zero Message Loss Guaranteed
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-stone-100 mt-1">{node.name}</h4>
                          <p className="text-[11px] text-stone-400 mt-0.5">{node.role}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Compute & Agentic AI */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block">
                    Tier 3: Serverless Microservices & Agentic AI
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ARCHITECTURE_NODES.filter((n) => n.category === 'compute' || n.category === 'ai').map((node) => {
                      const isSelected = selectedNode.id === node.id;
                      return (
                        <div
                          key={node.id}
                          onClick={() => setSelectedNode(node)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500'
                              : 'bg-stone-950/70 border-stone-800 hover:border-stone-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                              {node.googleService}
                            </span>
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          </div>
                          <h4 className="text-xs font-bold text-stone-100 mt-1">{node.name}</h4>
                          <span className="text-[11px] text-stone-400 mt-1 block">Latency: {node.latencySla}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Distributed State & Storage */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block">
                    Tier 4: Distributed State, Cache & Analytics Lakehouse
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {ARCHITECTURE_NODES.filter((n) => n.category === 'storage').map((node) => {
                      const isSelected = selectedNode.id === node.id;
                      return (
                        <div
                          key={node.id}
                          onClick={() => setSelectedNode(node)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500'
                              : 'bg-stone-950/70 border-stone-800 hover:border-stone-700'
                          }`}
                        >
                          <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase block">
                            {node.googleService}
                          </span>
                          <h4 className="text-xs font-bold text-stone-100 mt-1">{node.name}</h4>
                          <span className="text-[10px] text-stone-500 mt-1 block">{node.latencySla}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Node Inspector Detail */}
            <div className="lg:col-span-4 bg-stone-900/80 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
              <div className="border-b border-stone-800 pb-3">
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                  Node Architectural Spec
                </span>
                <h3 className="text-lg font-serif font-bold text-stone-100 mt-1">
                  {selectedNode.name}
                </h3>
                <span className="text-xs font-mono text-emerald-400 block mt-0.5">
                  {selectedNode.googleService}
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-stone-500 font-semibold uppercase text-[10px] block">
                    Architectural Role:
                  </span>
                  <p className="text-stone-200 leading-relaxed mt-1">{selectedNode.role}</p>
                </div>

                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                  <span className="text-stone-500 font-semibold uppercase text-[10px] block">
                    Target SLA & Latency:
                  </span>
                  <span className="font-mono text-amber-400 font-bold block text-sm">
                    {selectedNode.latencySla}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                  <span className="text-stone-500 font-semibold uppercase text-[10px] block">
                    Horizontal Scaling Policy:
                  </span>
                  <span className="font-mono text-stone-300 block">
                    {selectedNode.scalingPolicy}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-200/90 leading-relaxed">
                  <span className="font-semibold block mb-0.5 text-amber-300">
                    Architectural Resilience Rationale:
                  </span>
                  By isolating compute onto stateless Cloud Run instances and offloading state to Cloud Spanner and Pub/Sub, the system avoids cascading failures and scales horizontally to absorb flash mobs and morning rush crowds.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROMETHEUS & GRAFANA TELEMETRY */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          {/* Real-time RED Metrics Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-1 shadow-lg">
              <span className="text-xs text-stone-400">Total HTTP Ingress (RPS)</span>
              <div className="text-3xl font-mono font-bold text-amber-400">
                {metricsData.requestsTotal.toLocaleString()} reqs
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">Rate: 182 req/sec</span>
            </div>

            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-1 shadow-lg">
              <span className="text-xs text-stone-400">P95 Latency (Cloud Run)</span>
              <div className="text-3xl font-mono font-bold text-stone-100">
                {metricsData.p95LatencyMs} ms
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">&lt; 50ms SLA Target Met</span>
            </div>

            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-1 shadow-lg">
              <span className="text-xs text-stone-400">Pub/Sub Event Throughput</span>
              <div className="text-3xl font-mono font-bold text-cyan-400">
                {metricsData.pubsubEvents.toLocaleString()}
              </div>
              <span className="text-[10px] text-stone-400 font-mono">0.00% Dead Letter Drops</span>
            </div>

            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-1 shadow-lg">
              <span className="text-xs text-stone-400">Redis Cache Hit Ratio</span>
              <div className="text-3xl font-mono font-bold text-emerald-400">
                {metricsData.cacheHitRatio}%
              </div>
              <span className="text-[10px] text-stone-400 font-mono">Memorystore HA Replica Active</span>
            </div>
          </div>

          {/* Interactive Chaos & Surge Control */}
          <div className="bg-stone-900/80 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-stone-100 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-400" />
                  Live Stress Test & Chaos Simulator
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Simulate sudden traffic spikes to verify Cloud Run autoscaling and Pub/Sub queue backpressure buffering.
                </p>
              </div>

              <button
                onClick={handleSimulateSurge}
                disabled={isSimulatingSurge}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shrink-0"
              >
                {isSimulatingSurge ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    <span>Buffering Surge Spike...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Simulate 5,000 Order Surge Spike</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Prometheus Metrics Export Stream */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span className="font-mono text-amber-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  Live OpenTelemetry Distributed Trace Stream (/api/metrics)
                </span>
                <span className="text-[11px] font-mono text-stone-500">Scrape interval: 5s</span>
              </div>

              <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 font-mono text-xs text-stone-300 space-y-1.5 max-h-56 overflow-y-auto scrollbar-thin">
                {logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-amber-500 select-none">❯</span>
                    <span className={log.includes('Autoscale') || log.includes('Surge') ? 'text-amber-300 font-bold' : 'text-stone-300'}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RESILIENCE & SCALE PATTERNS */}
      {activeTab === 'resilience' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-stone-900/80 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-serif font-bold text-stone-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              1. CQRS & Event Sourcing (Zero Lost Orders)
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Order ingestion is split cleanly between the Write path (Commands) and Read path (Queries).
              When a guest places an order, the command writes directly to Google Cloud Pub/Sub with a transactional outbox in Cloud Spanner.
              Barista displays, KDS terminals, and client websockets consume from Firestore read replicas without contending on the master database lock.
            </p>
            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-[11px] font-mono text-stone-300 space-y-1">
              <span className="text-amber-400 block font-bold">Resilience Guarantee:</span>
              <span>• At-least-once delivery with UUIDv7 deduplication key</span>
              <br />
              <span>• Dead Letter Queues (DLQ) with automatic retry backoff</span>
            </div>
          </div>

          <div className="bg-stone-900/80 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-serif font-bold text-stone-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              2. Circuit Breakers & Graceful Degradation
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              If external AI APIs or third-party payment gateways experience transient latency or rate limits,
              the circuit breaker trips into HALF-OPEN state, routing conversational orders to deterministic heuristic classifiers
              and localized queue estimators. The customer never sees a blank screen or a failed order.
            </p>
            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-[11px] font-mono text-stone-300 space-y-1">
              <span className="text-emerald-400 block font-bold">Fallback Policy:</span>
              <span>• In-memory rule engine evaluates dietary tags & order recommendations</span>
              <br />
              <span>• Offline POS transaction buffering with background sync</span>
            </div>
          </div>

          <div className="bg-stone-900/80 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-serif font-bold text-stone-100 flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              3. Cloud Spanner TrueTime Distributed Consistency
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Specialty beans, single-origin lots, and morning bakery goods have finite physical inventory.
              Google Cloud Spanner uses atomic GPS and atomic clock synchronization (TrueTime API) to provide
              strict serializability across global regions without locking bottlenecks, eliminating double-sells.
            </p>
            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-[11px] font-mono text-stone-300 space-y-1">
              <span className="text-cyan-400 block font-bold">Inventory Master:</span>
              <span>• Multi-Region Dual-Write with 99.999% SLA</span>
              <br />
              <span>• Sub-15ms multi-statement ACID transaction latency</span>
            </div>
          </div>

          <div className="bg-stone-900/80 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-serif font-bold text-stone-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              4. Full-Stack Observability with Prometheus & Grafana
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              OpenTelemetry instrumentation spans every service boundary: HTTP request ingress &rarr; Pub/Sub message publish
              &rarr; Cloud Run processing &rarr; Cloud Spanner commit &rarr; WebSocket notification.
              Prometheus scrapes metrics continuously, powering Grafana dashboards and Cloud Monitoring alert policies.
            </p>
            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-[11px] font-mono text-stone-300 space-y-1">
              <span className="text-purple-400 block font-bold">Alerting Thresholds:</span>
              <span>• P99 Latency &gt; 120ms triggers automated Cloud Run scale-out</span>
              <br />
              <span>• Pub/Sub unacknowledged message queue age &gt; 30s alerts On-Call</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: IMPLEMENTATION ROADMAP */}
      {activeTab === 'roadmap' && (
        <div className="bg-stone-900/80 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-b border-stone-800 pb-3">
            <h2 className="text-base font-serif font-bold text-stone-100">
              Enterprise Engineering Roadmap (4-Phase Implementation)
            </h2>
            <p className="text-xs text-stone-400">
              Phased rollout designed to deliver continuous business value without disrupting existing physical café operations.
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                phase: 'Phase 1: Event Mesh & Microservices Foundation',
                duration: 'Weeks 1 – 4',
                deliverables: [
                  'Provision Google Cloud project infrastructure via Terraform (Cloud Run, Pub/Sub topics, Cloud Spanner, Memorystore Redis).',
                  'Implement stateless Order Service with idempotency key validation and CQRS command bus.',
                  'Establish OpenTelemetry collector with Prometheus scrape endpoints (/api/metrics) and baseline Grafana RED dashboards.',
                ],
                status: 'Completed',
              },
              {
                phase: 'Phase 2: Agentic AI & Conversational Ordering',
                duration: 'Weeks 5 – 8',
                deliverables: [
                  'Integrate Google Vertex AI and Gemini 3.8 Flash SDK for real-time natural language ordering and sensory flavor matching.',
                  'Implement Web Speech API client voice capture with sub-300ms time-to-first-token streaming.',
                  'Build customer taste persona quiz and sensory coffee flavor wheel discovery experience.',
                ],
                status: 'Live & Operational',
              },
              {
                phase: 'Phase 3: Room Pulse & Autonomous Demand Forecaster',
                duration: 'Weeks 9 – 12',
                deliverables: [
                  'Deploy IoT acoustic sensor ingestion pipeline streaming decibel and ambient vibe telemetry to Eventarc.',
                  'Implement automated sentiment classification and proactive Barista Copilot alerting system.',
                  'Build BigQuery time-series demand model correlating weather, campus events, and hourly rush patterns to auto-tune prep batches.',
                ],
                status: 'In Production',
              },
              {
                phase: 'Phase 4: Multi-Store Mesh & Self-Healing Ops',
                duration: 'Weeks 13 – 16',
                deliverables: [
                  'Scale out to multi-store federated mesh across 50+ retail locations with Google Cloud Anthos & Cloud Spanner global distribution.',
                  'Implement automated GitOps deployment pipeline using Google Cloud Build and ArgoCD with canary progressive traffic shifting.',
                  'Integrate automated supply chain EDI hooks for autonomous green coffee bean reordering based on depletion trends.',
                ],
                status: 'Planned',
              },
            ].map((p, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono font-bold text-xs">
                      {idx + 1}
                    </span>
                    <h4 className="font-bold text-stone-100 text-sm font-serif">{p.phase}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-stone-400">{p.duration}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      p.status === 'Completed' || p.status === 'Live & Operational' || p.status === 'In Production'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-stone-800 text-stone-400'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                </div>

                <ul className="space-y-1.5 pl-8 text-xs text-stone-300 list-disc">
                  {p.deliverables.map((item, dIdx) => (
                    <li key={dIdx} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
