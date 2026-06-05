"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Mail,
  FileText,
  Coins,
  Package,
  RefreshCw,
  Clock,
  Layers,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
};

type TimelineEvent = {
  type: string;
  message: string;
  queueName?: string;
  jobId?: string;
  timestamp: string;
};

type Order = {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: string;
  paymentStatus: "pending" | "processing" | "paid" | "failed";
  invoiceStatus: "pending" | "generated" | "failed";
  emailStatus: "pending" | "sent" | "failed";
  shipmentStatus: "pending" | "processing" | "shipped" | "delivered" | "failed";
  timeline: TimelineEvent[];
  createdAt: string;
};

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(true);

  async function fetchOrder() {
    try {
      const response = await fetch(`/api/orders/${id}`);
      const data = await response.json();
      if (data.success) {
        setOrder(data.order);

        // Stop polling if order has reached final states
        const currentStatus = data.order.status;
        const subStatusesFinished =
          (data.order.paymentStatus === "paid" || data.order.paymentStatus === "failed") &&
          (data.order.invoiceStatus === "generated" || data.order.invoiceStatus === "failed") &&
          (data.order.emailStatus === "sent" || data.order.emailStatus === "failed") &&
          (data.order.shipmentStatus === "shipped" || data.order.shipmentStatus === "failed");

        if (currentStatus === "shipped" || currentStatus === "failed" || subStatusesFinished) {
          setPolling(false);
        }
      } else {
        setError(data.error || "Order not found");
        setPolling(false);
      }
    } catch (err) {
      setError("Failed to load order");
      setPolling(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrder();

    if (!polling) return;

    const interval = setInterval(() => {
      fetchOrder();
    }, 2000);

    return () => clearInterval(interval);
  }, [id, polling]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center">
        <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
        <p className="mt-4 text-sm font-medium text-neutral-600">Retrieving operational audit trail...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6">
        <AlertCircle className="h-12 w-12 text-rose-500" />
        <h1 className="mt-4 text-xl font-semibold text-neutral-900">Order Audit Trail Unavailable</h1>
        <p className="mt-2 text-sm text-neutral-600">{error || "Order not found"}</p>
        <Button asChild className="mt-6">
          <Link href="/">Return to Storefront</Link>
        </Button>
      </div>
    );
  }

  const getPipelineStatusColor = (status: string) => {
    switch (status) {
      case "paid":
      case "generated":
      case "sent":
      case "shipped":
        return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "processing":
        return "text-indigo-600 bg-indigo-50 border-indigo-200 animate-pulse";
      case "failed":
        return "text-rose-600 bg-rose-50 border-rose-200";
      default:
        return "text-neutral-500 bg-neutral-50 border-neutral-200";
    }
  };

  const getPipelineStatusIcon = (status: string, defaultIcon: any) => {
    if (status === "paid" || status === "generated" || status === "sent" || status === "shipped") {
      return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
    }
    if (status === "failed") {
      return <AlertCircle className="h-5 w-5 text-rose-600" />;
    }
    if (status === "processing") {
      return <RefreshCw className="h-5 w-5 text-indigo-600 animate-spin" />;
    }
    return defaultIcon;
  };

  return (
    <main className="min-h-screen bg-neutral-50 pb-20 font-sans antialiased text-neutral-900">
      {/* Header Bar */}
      <header className="border-b bg-white border-neutral-200/80 sticky top-0 z-40 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild size="icon" variant="outline" className="h-9 w-9 rounded-lg border-neutral-200">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 text-neutral-600" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-500">Invoice Audit</span>
                <span className="h-1 w-1 rounded-full bg-neutral-350" />
                <span className="text-xs font-mono text-neutral-500">Order: {order.orderNumber}</span>
              </div>
              <h1 className="text-lg font-semibold tracking-tight text-neutral-900">Pipeline Tracking</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {polling && (
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200/80 gap-1.5 py-1 px-2.5 animate-pulse font-mono text-[10px] uppercase">
                <RefreshCw className="h-3 w-3 animate-spin text-indigo-600" />
                Processing Jobs...
              </Badge>
            )}
            <Button asChild variant="outline" size="sm" className="border-neutral-200 text-neutral-600">
              <Link href="/admin">Admin Console</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10 grid gap-8 md:grid-cols-12">

        {/* Left: Pipeline Status Board (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">BullMQ Processing Pipeline</h2>

          <div className="space-y-4">
            {/* Step 1: Payment */}
            <div className={`p-4 rounded-xl border flex items-center gap-4 bg-white transition-all ${getPipelineStatusColor(order.paymentStatus)}`}>
              <div className="p-2.5 rounded-lg border bg-white shadow-sm shrink-0">
                {getPipelineStatusIcon(order.paymentStatus, <Coins className="h-5 w-5 text-neutral-400" />)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-neutral-900">1. Payment Settlement</p>
                  <span className="text-xs font-mono capitalize">{order.paymentStatus}</span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">Processed on queue: payment_processing</p>
              </div>
            </div>

            {/* Step 2: Invoice */}
            <div className={`p-4 rounded-xl border flex items-center gap-4 bg-white transition-all ${getPipelineStatusColor(order.invoiceStatus)}`}>
              <div className="p-2.5 rounded-lg border bg-white shadow-sm shrink-0">
                {getPipelineStatusIcon(order.invoiceStatus, <FileText className="h-5 w-5 text-neutral-400" />)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-neutral-900">2. Document Invoice Generation</p>
                  <span className="text-xs font-mono capitalize">{order.invoiceStatus}</span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">Processed on queue: invoice_generation</p>
              </div>
            </div>

            {/* Step 3: Inventory Alloc */}
            <div className={`p-4 rounded-xl border flex items-center gap-4 bg-white transition-all ${order.status === "pending_payment" || order.status === "payment_processing" || order.status === "failed"
                ? getPipelineStatusColor("pending")
                : order.status === "inventory_syncing"
                  ? getPipelineStatusColor("processing")
                  : getPipelineStatusColor("paid")
              }`}>
              <div className="p-2.5 rounded-lg border bg-white shadow-sm shrink-0">
                {getPipelineStatusIcon(
                  order.status === "pending_payment" || order.status === "payment_processing" || order.status === "failed"
                    ? "pending"
                    : order.status === "inventory_syncing"
                      ? "processing"
                      : "paid",
                  <Package className="h-5 w-5 text-neutral-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-neutral-900">3. Stock Deductions & Sync</p>
                  <span className="text-xs font-mono capitalize">
                    {order.status === "pending_payment" || order.status === "payment_processing" || order.status === "failed"
                      ? "pending"
                      : order.status === "inventory_syncing"
                        ? "processing"
                        : "completed"}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">Processed on queue: inventory_sync</p>
              </div>
            </div>

            {/* Step 4: Shipment Hand-off */}
            <div className={`p-4 rounded-xl border flex items-center gap-4 bg-white transition-all ${getPipelineStatusColor(order.shipmentStatus)}`}>
              <div className="p-2.5 rounded-lg border bg-white shadow-sm shrink-0">
                {getPipelineStatusIcon(order.shipmentStatus, <Package className="h-5 w-5 text-neutral-400" />)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-neutral-900">4. Courier Logistics</p>
                  <span className="text-xs font-mono capitalize">{order.shipmentStatus}</span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">Processed on queue: shipment_updates</p>
              </div>
            </div>

            {/* Step 5: Notifications */}
            <div className={`p-4 rounded-xl border flex items-center gap-4 bg-white transition-all ${getPipelineStatusColor(order.emailStatus)}`}>
              <div className="p-2.5 rounded-lg border bg-white shadow-sm shrink-0">
                {getPipelineStatusIcon(order.emailStatus, <Mail className="h-5 w-5 text-neutral-400" />)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-neutral-900">5. Confirmation Dispatch</p>
                  <span className="text-xs font-mono capitalize">{order.emailStatus}</span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">Processed on queue: email_notifications</p>
              </div>
            </div>

          </div>
        </div>

        {/* Right: Order Summary & Customer (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">Order details</h2>

          <Card className="border-neutral-200/80 bg-white shadow-sm">
            <CardHeader className="pb-3 border-b border-neutral-100">
              <CardTitle className="text-sm font-semibold text-neutral-800">Customer Profile</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              <div>
                <p className="text-xs text-neutral-500">Name</p>
                <p className="text-sm font-medium text-neutral-900">{order.customer.name}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Email Address</p>
                <p className="text-sm font-medium text-neutral-900 font-mono">{order.customer.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-neutral-200/80 bg-white shadow-sm">
            <CardHeader className="pb-3 border-b border-neutral-100">
              <CardTitle className="text-sm font-semibold text-neutral-800">Order Totals</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="space-y-2 border-b pb-3 border-neutral-100">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-xs text-neutral-600">
                    <span>{item.name} (x{item.quantity})</span>
                    <span className="font-mono">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>Subtotal</span>
                  <span className="font-mono">${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>Logistics Fee</span>
                  <span className="font-mono">${order.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-neutral-900 pt-1.5 border-t border-neutral-100">
                  <span>Total Charges</span>
                  <span className="font-mono">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Audit log timeline section (Full Width) */}
      <div className="mx-auto max-w-5xl px-6 py-6 border-t border-neutral-200">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-neutral-500" />
            <h2 className="text-base font-semibold text-neutral-950">Job Execution Audit Trail</h2>
          </div>
          <span className="text-xs text-neutral-400 font-mono">Live Sync Enabled</span>
        </div>

        <div className="relative border-l border-neutral-200 pl-6 ml-3 space-y-8">
          {order.timeline.length === 0 ? (
            <p className="text-sm text-neutral-500 italic">No job execution events recorded.</p>
          ) : (
            order.timeline.map((event, index) => (
              <div key={index} className="relative">
                {/* Visual Circle Marker */}
                <span className="absolute left-[-31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-neutral-300 bg-white shadow-sm ring-4 ring-neutral-50">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                </span>

                <div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-neutral-200/60 text-neutral-700 border uppercase tracking-wider font-semibold">
                        {event.type}
                      </span>
                      <p className="text-sm font-medium text-neutral-900">{event.message}</p>
                    </div>

                    <span className="text-xs text-neutral-450 font-mono">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>

                  {event.queueName && (
                    <div className="mt-2 p-3 bg-neutral-100/50 rounded-lg border border-neutral-200/60 inline-flex flex-wrap gap-x-6 gap-y-2 text-xs font-mono">
                      <div>
                        <span className="text-neutral-400 font-semibold uppercase">Queue Name:</span>{" "}
                        <span className="text-neutral-700">{event.queueName}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 font-semibold uppercase">BullMQ Job ID:</span>{" "}
                        <span className="text-neutral-700 select-all">{event.jobId}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}