"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  Activity, 
  Cpu, 
  AlertTriangle, 
  Play, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowRight,
  Server,
  Zap,
  Sliders
} from "lucide-react";
import Link from "next/link";

type FailureRule = {
  key: string;
  enabled: boolean;
  probability: number;
  affectedQueue: string;
  config?: any;
};

type WorkerHeartbeat = {
  workerName: string;
  queueName: string;
  status: "healthy" | "slow" | "offline";
  lastSeenAt: string;
  activeJobs: number;
  processedToday: number;
  failedToday: number;
};

type JobEvent = {
  _id: string;
  queueName: string;
  jobId: string;
  orderId?: string;
  event: "created" | "active" | "completed" | "failed" | "retried" | "dead_lettered";
  attemptsMade: number;
  errorMessage?: string;
  durationMs?: number;
  createdAt: string;
};

export default function AdminPage() {
  const [rules, setRules] = useState<FailureRule[]>([]);
  const [workers, setWorkers] = useState<WorkerHeartbeat[]>([]);
  const [events, setEvents] = useState<JobEvent[]>([]);
  const [orderCount, setOrderCount] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function fetchStats() {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();
      if (data.success) {
        setWorkers(data.heartbeats || []);
        setEvents(data.recentEvents || []);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  }

  async function fetchRules() {
    try {
      const response = await fetch("/api/failure-rules");
      const data = await response.json();
      if (data.success) {
        setRules(data.rules || []);
      }
    } catch (err) {
      console.error("Error fetching rules:", err);
    }
  }

  async function handleToggleRule(key: string, enabled: boolean) {
    try {
      const response = await fetch("/api/failure-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, enabled }),
      });
      const data = await response.json();
      if (data.success) {
        setRules(prev => prev.map(r => r.key === key ? data.rule : r));
      }
    } catch (err) {
      console.error("Error toggling rule:", err);
    }
  }

  async function handleProbabilityChange(key: string, probability: number) {
    try {
      const response = await fetch("/api/failure-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, probability }),
      });
      const data = await response.json();
      if (data.success) {
        setRules(prev => prev.map(r => r.key === key ? data.rule : r));
      }
    } catch (err) {
      console.error("Error changing probability:", err);
    }
  }

  async function handleGenerateOrders() {
    try {
      setLoading(true);
      setMessage(null);
      const response = await fetch("/api/orders/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: orderCount }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage(`Success: ${data.message}`);
        fetchStats();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage("Failed to inject operational load.");
    } finally {
      setLoading(false);
    }
  }

  // Initial load
  useEffect(() => {
    fetchRules();
    fetchStats();

    // Auto-refresh telemetry and heartbeats every 3 seconds
    const interval = setInterval(() => {
      fetchStats();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const triggerManualRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchRules(), fetchStats()]);
    setRefreshing(false);
  };

  const getEventBadgeColor = (event: string) => {
    switch (event) {
      case "created":
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case "active":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "completed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "failed":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "retried":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "dead_lettered":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";
    }
  };

  const getWorkerStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/10">Active</Badge>;
      case "slow":
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/25 hover:bg-amber-500/10 animate-pulse">Degraded</Badge>;
      case "offline":
        return <Badge className="bg-neutral-500/10 text-neutral-400 border-neutral-500/25 hover:bg-neutral-500/10">Offline</Badge>;
      default:
        return <Badge className="bg-neutral-500/10 text-neutral-400 border-neutral-500/25 hover:bg-neutral-500/10">Unknown</Badge>;
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 antialiased font-sans">
      {/* Premium Gradient Top Border */}
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500" />
      
      <header className="border-b border-neutral-800 bg-neutral-900/40 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <Zap className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">ShopFlow Operations</h1>
                <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 border-indigo-500/30">
                  Telemetry Simulator
                </Badge>
              </div>
              <p className="text-xs text-neutral-400">Believable corporate environment feeding QueueWatch dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button asChild size="sm" variant="outline" className="border-neutral-800 text-neutral-300 hover:bg-neutral-800">
              <Link href="/">Storefront</Link>
            </Button>
            <Button 
              onClick={triggerManualRefresh} 
              size="sm" 
              variant="outline" 
              className="border-neutral-800 text-neutral-300 hover:bg-neutral-800 gap-2"
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Sync
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 grid gap-8">
        
        {/* Top Grid: Control Panel & Worker Monitor */}
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* Load Injector & Outage Control Panel (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Load Injector Card */}
            <Card className="border-neutral-800 bg-neutral-900/60 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Play className="h-24 w-24 text-white" />
              </div>
              <CardHeader className="pb-3 border-b border-neutral-800">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <Activity className="h-4 w-4 text-indigo-400" />
                  Telemetry Load Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-xs text-neutral-400 mb-4">
                  Inject dummy transactions into the checkout pipe to spin up BullMQ worker threads.
                </p>
                <div className="flex gap-3">
                  <div className="w-32">
                    <Input 
                      type="number" 
                      min="1" 
                      max="20"
                      value={orderCount} 
                      onChange={(e) => setOrderCount(parseInt(e.target.value) || 1)}
                      className="bg-neutral-950 border-neutral-800 text-white placeholder-neutral-600 focus-visible:ring-indigo-500 focus-visible:border-indigo-500" 
                    />
                  </div>
                  <Button 
                    onClick={handleGenerateOrders} 
                    disabled={loading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10 active:scale-95 transition-transform"
                  >
                    {loading ? "Generating Operational Telemetry..." : `Queue ${orderCount} Random Orders`}
                  </Button>
                </div>
                {message && (
                  <div className={`mt-3 p-3 rounded-lg text-xs font-mono border ${
                    message.startsWith("Success") 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  }`}>
                    {message}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Outage Simulation Slider Panel */}
            <Card className="border-neutral-800 bg-neutral-900/60 shadow-xl">
              <CardHeader className="pb-3 border-b border-neutral-800">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-rose-400" />
                  Incident & Outage Simulator
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 divide-y divide-neutral-800">
                {rules.length === 0 ? (
                  <p className="text-sm text-neutral-400 py-4 text-center">Loading outage triggers...</p>
                ) : (
                  rules.map((rule) => (
                    <div key={rule.key} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white font-mono">{rule.key}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 uppercase tracking-wider font-mono">
                            {rule.affectedQueue}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">
                          {rule.config?.message || "Simulates worker exceptions to trigger automated recovery flows."}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Probability setting */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-400 font-mono">Fail rate:</span>
                          <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.05"
                            value={rule.probability}
                            onChange={(e) => handleProbabilityChange(rule.key, parseFloat(e.target.value))}
                            className="w-24 accent-indigo-500 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-xs font-semibold font-mono w-8 text-neutral-300">
                            {Math.round(rule.probability * 100)}%
                          </span>
                        </div>

                        {/* Switch Trigger */}
                        <button
                          onClick={() => handleToggleRule(rule.key, !rule.enabled)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            rule.enabled ? "bg-indigo-600" : "bg-neutral-800"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              rule.enabled ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

          </div>

          {/* Worker Health Monitor (5 cols) */}
          <div className="lg:col-span-5">
            <Card className="border-neutral-800 bg-neutral-900/60 shadow-xl h-full flex flex-col">
              <CardHeader className="pb-3 border-b border-neutral-800 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-emerald-400" />
                  Worker Health Monitor
                </CardTitle>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Polling Live
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1 overflow-y-auto space-y-4">
                {workers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
                    <Server className="h-10 w-10 text-neutral-600 mb-2 animate-bounce" />
                    <p className="text-xs font-mono">No active worker instances found</p>
                    <p className="text-[10px] text-neutral-600 mt-1">Start tsx workers/index.ts to bind workers</p>
                  </div>
                ) : (
                  workers.map((worker) => (
                    <div 
                      key={worker.workerName} 
                      className="p-4 rounded-xl border border-neutral-800/80 bg-neutral-950/40 hover:border-neutral-700/60 transition-all flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white font-mono">{worker.workerName}</p>
                          <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">Queue: {worker.queueName}</p>
                        </div>
                        {getWorkerStatusBadge(worker.status)}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 bg-neutral-950/70 p-2.5 rounded-lg text-center border border-neutral-900">
                        <div>
                          <p className="text-[10px] text-neutral-500 uppercase font-semibold">Active</p>
                          <p className="text-base font-bold font-mono text-white mt-0.5">{worker.activeJobs}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-neutral-500 uppercase font-semibold">Success</p>
                          <p className="text-base font-bold font-mono text-emerald-450 mt-0.5">{worker.processedToday}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-neutral-500 uppercase font-semibold">Failed</p>
                          <p className={`text-base font-bold font-mono mt-0.5 ${worker.failedToday > 0 ? "text-rose-500" : "text-neutral-450"}`}>
                            {worker.failedToday}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                        <span>Heartbeat interval: 10s</span>
                        <span>Seen: {new Date(worker.lastSeenAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

        </div>

        {/* Bottom Panel: Telemetry Grid Feed */}
        <Card className="border-neutral-800 bg-neutral-900/60 shadow-xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-neutral-800 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Server className="h-4 w-4 text-indigo-400" />
              Real-Time Job Telemetry Feed
            </CardTitle>
            <Badge variant="outline" className="font-mono text-xs text-neutral-400 border-neutral-800 bg-neutral-950">
              {events.length} logs captured
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-neutral-950/55 border-b border-neutral-800">
                  <TableRow className="border-neutral-800 hover:bg-transparent">
                    <TableHead className="text-neutral-400 font-mono text-xs w-[180px]">Timestamp</TableHead>
                    <TableHead className="text-neutral-400 font-mono text-xs w-[160px]">Queue</TableHead>
                    <TableHead className="text-neutral-400 font-mono text-xs">Job ID</TableHead>
                    <TableHead className="text-neutral-400 font-mono text-xs w-[120px]">Event</TableHead>
                    <TableHead className="text-neutral-400 font-mono text-xs w-[100px]">Attempts</TableHead>
                    <TableHead className="text-neutral-400 font-mono text-xs w-[120px]">Associated Order</TableHead>
                    <TableHead className="text-neutral-400 font-mono text-xs">Duration/Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={7} className="text-center py-12 text-neutral-500 font-mono text-xs">
                        No telemetry logs in buffer. Generate some queue transactions above.
                      </TableCell>
                    </TableRow>
                  ) : (
                    events.map((event) => (
                      <TableRow key={event._id} className="border-neutral-800 hover:bg-neutral-900/20 font-mono text-xs">
                        <TableCell className="text-neutral-400">
                          {new Date(event.createdAt).toLocaleTimeString()}
                          <span className="text-[10px] text-neutral-600 block">
                            {new Date(event.createdAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="font-semibold text-neutral-250">{event.queueName}</TableCell>
                        <TableCell className="text-neutral-500 max-w-[120px] truncate" title={event.jobId}>
                          {event.jobId}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`px-2 py-0.5 rounded text-[10px] font-mono border uppercase tracking-wider font-medium ${getEventBadgeColor(event.event)}`}>
                            {event.event}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-neutral-300">{event.attemptsMade}</TableCell>
                        <TableCell>
                          {event.orderId ? (
                            <Link 
                              href={`/orders/${event.orderId}`}
                              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 flex items-center gap-1 group"
                            >
                              Details
                              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                          ) : (
                            <span className="text-neutral-600">—</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[280px] truncate text-neutral-300">
                          {event.errorMessage ? (
                            <span className="text-rose-400 flex items-center gap-1.5" title={event.errorMessage}>
                              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                              {event.errorMessage}
                            </span>
                          ) : event.durationMs !== undefined ? (
                            <span className="text-neutral-400 flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
                              {event.durationMs}ms
                            </span>
                          ) : (
                            <span className="text-neutral-600">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

      </div>
    </main>
  );
}
